import { GoogleGenAI } from '@google/genai';
import { db, BankingDatabase } from '../db';
import { User, Transaction, Account } from '../types';

export interface AIServiceResponse {
  reply: string;
  toolCallsExecuted?: {
    tool: string;
    params: Record<string, unknown>;
    resultSummary: string;
  }[];
  isSimulatedFallback: boolean;
  modelUsed: string;
}

// System Prompt for Banking Assistant
const BANKING_SYSTEM_PROMPT = `
You are the AI Banking Assistant for NexaBank AI, a modern enterprise digital bank.
Your role is to assist the authenticated customer with balance inquiries, spending analysis, transaction history, and general financial guidance.

SECURITY & ARCHITECTURAL RULES:
1. You only have READ-ONLY access to the current authenticated customer's data via predefined banking tools.
2. NEVER disclose unmasked account numbers. Always format as "•••• 1234".
3. NEVER promise or execute financial transactions, wire transfers, beneficiary creations, or balance edits directly. If the customer asks you to send money, draft the parameters (amount, recipient, source account) and instruct them to review and execute it safely via the Transfers screen.
4. Distinguish verified facts (actual account numbers and ledger amounts retrieved from tools) from general financial education.
5. Provide crisp, professional formatting using clean markdown lists, bold metrics, and structured tables when appropriate.
6. Always maintain a courteous, concise, and trustworthy banking tone.
`;

export class AIService {
  private aiClient: GoogleGenAI | null = null;
  private db: BankingDatabase;

  constructor(dbInstance?: BankingDatabase) {
    this.db = dbInstance || db;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.warn('[AIService] Failed to initialize GoogleGenAI client:', err);
      }
    }
  }

  // Safe Tool 1: Get Account Summary
  public getAccountSummary(user: User): {
    totalAvailable: string;
    totalLedger: string;
    accounts: {
      id: string;
      nickname?: string;
      maskedNumber: string;
      type: string;
      available: string;
      ledger: string;
      status: string;
    }[];
  } {
    const accounts = this.db.getAccountsByOwnerId(user.id);
    let totalAvailCents = 0;
    let totalLedgerCents = 0;

    const formatted = accounts.map((acc) => {
      totalAvailCents += acc.availableBalanceCents;
      totalLedgerCents += acc.ledgerBalanceCents;
      return {
        id: acc.id,
        nickname: acc.nickname,
        maskedNumber: acc.maskedAccountNumber,
        type: acc.accountType,
        available: `$${(acc.availableBalanceCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        ledger: `$${(acc.ledgerBalanceCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        status: acc.status
      };
    });

    return {
      totalAvailable: `$${(totalAvailCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      totalLedger: `$${(totalLedgerCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      accounts: formatted
    };
  }

  // Safe Tool 2: Recent Transactions
  public getRecentTransactions(user: User, limit: number = 5): {
    reference: string;
    description: string;
    type: string;
    amount: string;
    status: string;
    date: string;
    category: string;
  }[] {
    const txns = this.db.getTransactionsByOwnerId(user.id);
    const clamped = Math.min(Math.max(limit, 1), 20);
    return txns.slice(0, clamped).map((t) => ({
      reference: t.transactionReference,
      description: t.description,
      type: t.type,
      amount: `${t.type === 'DEPOSIT' || t.type === 'INTEREST' ? '+' : '-'}$${(t.amountCents / 100).toFixed(2)}`,
      status: t.status,
      date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: t.category
    }));
  }

  // Safe Tool 3: Spending Breakdown
  public getSpendingByCategory(user: User): {
    categories: { category: string; amountCents: number; amountFormatted: string; percentage: number }[];
    totalSpent: string;
  } {
    const txns = this.db.getTransactionsByOwnerId(user.id);
    const categoryTotals: Record<string, number> = {};
    let totalCents = 0;

    for (const t of txns) {
      if (t.status === 'COMPLETED' && (t.type === 'BILL_PAY' || t.type === 'TRANSFER' || t.type === 'WITHDRAWAL')) {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amountCents;
        totalCents += t.amountCents;
      }
    }

    const categories = Object.entries(categoryTotals).map(([category, amountCents]) => ({
      category,
      amountCents,
      amountFormatted: `$${(amountCents / 100).toFixed(2)}`,
      percentage: totalCents > 0 ? Math.round((amountCents / totalCents) * 100) : 0
    })).sort((a, b) => b.amountCents - a.amountCents);

    return {
      categories,
      totalSpent: `$${(totalCents / 100).toFixed(2)}`
    };
  }

  // Safe Tool 4: Monthly Comparison
  public getMonthlySummary(user: User): {
    currentMonthIncome: string;
    currentMonthExpenses: string;
    netSavings: string;
  } {
    const txns = this.db.getTransactionsByOwnerId(user.id);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let incomeCents = 0;
    let expenseCents = 0;

    for (const t of txns) {
      if (t.status !== 'COMPLETED') continue;
      const d = new Date(t.createdAt);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.type === 'DEPOSIT' || t.type === 'INTEREST') {
          incomeCents += t.amountCents;
        } else {
          expenseCents += t.amountCents;
        }
      }
    }

    const netCents = incomeCents - expenseCents;
    return {
      currentMonthIncome: `$${(incomeCents / 100).toFixed(2)}`,
      currentMonthExpenses: `$${(expenseCents / 100).toFixed(2)}`,
      netSavings: `${netCents >= 0 ? '+' : '-'}$${(Math.abs(netCents) / 100).toFixed(2)}`
    };
  }

  // Safe Tool 5: Transaction Status Lookup
  public explainTransactionStatus(user: User, reference: string): {
    found: boolean;
    reference: string;
    status: string;
    description: string;
    amount: string;
    explanation: string;
  } {
    const txn = this.db.getTransactionByReference(reference);
    if (!txn || txn.ownerId !== user.id) {
      return {
        found: false,
        reference,
        status: 'UNKNOWN',
        description: '',
        amount: '',
        explanation: 'Transaction reference not found in your customer records.'
      };
    }

    let explanation = 'Transaction posted and verified in bank ledger.';
    if (txn.status === 'FAILED') {
      explanation = `Transfer was rejected. Reason: ${txn.failureReason || 'Risk evaluation threshold triggered.'}`;
    } else if (txn.status === 'PENDING') {
      explanation = 'Transfer is currently queued in ACH clearing pipeline. Funds are placed on hold.';
    }

    return {
      found: true,
      reference: txn.transactionReference,
      status: txn.status,
      description: txn.description,
      amount: `$${(txn.amountCents / 100).toFixed(2)}`,
      explanation
    };
  }

  // Main chat processing method
  public async processChat(
    user: User,
    userMessage: string
  ): Promise<AIServiceResponse> {
    const query = userMessage.toLowerCase().trim();

    // 1. Gather banking context using safe tools
    const toolExecutions: { tool: string; params: Record<string, unknown>; resultSummary: string }[] = [];

    const accountSummary = this.getAccountSummary(user);
    toolExecutions.push({
      tool: 'getAccountSummary',
      params: { userId: user.id },
      resultSummary: `Total Available: ${accountSummary.totalAvailable}`
    });

    const recentTxns = this.getRecentTransactions(user, 5);
    toolExecutions.push({
      tool: 'getRecentTransactions',
      params: { limit: 5 },
      resultSummary: `${recentTxns.length} records retrieved`
    });

    const spendingSummary = this.getSpendingByCategory(user);
    const monthlySummary = this.getMonthlySummary(user);

    // 2. If Gemini API client is available, leverage gemini-3.8-flash
    if (this.aiClient) {
      try {
        const prompt = `
${BANKING_SYSTEM_PROMPT}

CUSTOMER CONTEXT:
Name: ${user.name}
Customer ID: ${user.id}

LIVE VERIFIED BANKING DATA:
- Accounts: ${JSON.stringify(accountSummary)}
- Monthly Cash Flow: Income ${monthlySummary.currentMonthIncome}, Expenses ${monthlySummary.currentMonthExpenses}, Net ${monthlySummary.netSavings}
- Spending Categories: ${JSON.stringify(spendingSummary.categories)}
- Recent 5 Transactions: ${JSON.stringify(recentTxns)}

CUSTOMER QUESTION:
"${userMessage}"

Respond accurately and professionally. Use markdown tables or lists when appropriate. Never execute a transfer.
`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        const reply = response.text || 'I analyzed your account, but could not produce a response at this moment.';
        return {
          reply,
          toolCallsExecuted: toolExecutions,
          isSimulatedFallback: false,
          modelUsed: 'gemini-3.8-flash'
        };
      } catch (err) {
        console.warn('[AIService] Gemini API invocation error, falling back to deterministic banking engine:', err);
      }
    }

    // 3. Robust, high-intelligence deterministic fallback banking assistant
    let reply = '';

    if (query.includes('balance') || query.includes('how much do i have') || query.includes('account summary')) {
      reply = `### Account Balances Overview\n\n` +
        `You currently have a total available balance of **${accountSummary.totalAvailable}** across your active accounts:\n\n` +
        `| Account | Number | Available | Ledger | Status |\n` +
        `| :--- | :--- | :--- | :--- | :--- |\n` +
        accountSummary.accounts.map(a => `| **${a.nickname || a.type}** | \`${a.maskedNumber}\` | ${a.available} | ${a.ledger} | ${a.status} |`).join('\n') +
        `\n\n*Note: Available balance reflects instant funds ready for transfers. Ledger balance includes pending settlement items.*`;
    } else if (query.includes('spend') || query.includes('expense') || query.includes('category') || query.includes('food') || query.includes('groceries')) {
      const topCat = spendingSummary.categories.slice(0, 5);
      reply = `### Spending & Expense Analysis\n\n` +
        `Total recorded debits across your accounts are **${spendingSummary.totalSpent}**.\n\n` +
        `**Top Spending Categories:**\n` +
        topCat.map(c => `• **${c.category}**: ${c.amountFormatted} (${c.percentage}% of debits)`).join('\n') +
        `\n\n*Tip: You can set monthly category budgets in the Analytics tab.*`;
    } else if (query.includes('recent') || query.includes('last transactions') || query.includes('transactions')) {
      reply = `### Recent 5 Account Transactions\n\n` +
        `Here are your latest ledger activities:\n\n` +
        recentTxns.map((t, idx) => `${idx + 1}. **${t.date}** — **${t.description}**\n   Amount: \`${t.amount}\` · Category: *${t.category}* · Status: **${t.status}** (\`${t.reference}\`)`).join('\n\n') +
        `\n\n*Full history and CSV export are available under Transaction History.*`;
    } else if (query.includes('difference between available') || query.includes('ledger balance') || query.includes('available balance')) {
      reply = `### Available Balance vs. Ledger Balance Explained\n\n` +
        `In banking architecture, there is an important distinction between these two figures:\n\n` +
        `1. **Available Balance**:\n` +
        `   • The exact amount of money you can spend or transfer **immediately**.\n` +
        `   • Deducts pending card authorizations, merchant holds, and outgoing wire transfers.\n` +
        `   • Your current available balance is **${accountSummary.totalAvailable}**.\n\n` +
        `2. **Ledger (Posted) Balance**:\n` +
        `   • The total balance officially settled at the close of the banking business day.\n` +
        `   • Does not yet factor in intra-day holds until settlement batch completes.\n` +
        `   • Your current ledger balance is **${accountSummary.totalLedger}**.`;
    } else if (query.includes('transfer') || query.includes('send') || query.includes('pay')) {
      reply = `### Transfer Preparation\n\n` +
        `As an AI assistant, I operate under **read-only banking security controls** and cannot independently initiate financial transfers or debit your accounts.\n\n` +
        `To send money:\n` +
        `1. Navigate to the **Transfers** module in the sidebar.\n` +
        `2. Select your funding account (e.g., Primary Checking \`•••• 4821\`).\n` +
        `3. Choose a verified beneficiary or enter account details.\n` +
        `4. Review the security confirmation screen and click **Execute Transfer**.\n\n` +
        `*Would you like me to check your available balance before you initiate?*`;
    } else if (query.includes('failed') || query.includes('failure')) {
      const failed = db.getTransactionsByOwnerId(user.id).find(t => t.status === 'FAILED');
      if (failed) {
        reply = `### Failed Transfer Diagnostic\n\n` +
          `I identified a recent failed transaction on record:\n` +
          `• **Reference**: \`${failed.transactionReference}\`\n` +
          `• **Target**: ${failed.beneficiaryName || 'External Payee'}\n` +
          `• **Amount**: $${(failed.amountCents / 100).toFixed(2)}\n` +
          `• **Failure Reason**: *${failed.failureReason || 'Velocity policy check'}*\n\n` +
          `*Recommended Resolution*: The transfer triggered a simulated daily velocity limit or compliance safeguard. Please verify your daily limit or contact our Operations Desk.`;
      } else {
        reply = `All your recent transactions have completed successfully! There are no failed transfers recorded in your recent transaction log.`;
      }
    } else if (query.includes('statement') || query.includes('download')) {
      reply = `### Account Statements & Exports\n\n` +
        `You can export your official bank statements at any time:\n` +
        `• Navigate to **Transaction History** in the navigation bar.\n` +
        `• Use the **Date Range** filter to select your desired statement period.\n` +
        `• Click the **Export CSV** button in the top right to download a reconciled statement for accounting.\n` +
        `• For individual transactions, click any row to view and print an official **Transaction Receipt**.`;
    } else {
      reply = `### Financial Summary for ${user.name}\n\n` +
        `Here is a quick snapshot of your NexaBank AI accounts:\n\n` +
        `• **Total Available Balance**: **${accountSummary.totalAvailable}**\n` +
        `• **Current Month Inflow**: **${monthlySummary.currentMonthIncome}**\n` +
        `• **Current Month Outflow**: **${monthlySummary.currentMonthExpenses}**\n` +
        `• **Net Savings Growth**: **${monthlySummary.netSavings}**\n\n` +
        `You can ask me to:\n` +
        `• *"Summarize my spending this month"*\n` +
        `• *"Show my five most recent transactions"*\n` +
        `• *"Explain the difference between available balance and ledger balance"*\n` +
        `• *"Help me understand a failed simulated transfer"*\n` +
        `• *"How can I download my account statement?"*`;
    }

    return {
      reply,
      toolCallsExecuted: toolExecutions,
      isSimulatedFallback: true,
      modelUsed: 'nexabank-deterministic-financial-engine'
    };
  }
}

export const aiService = new AIService();
