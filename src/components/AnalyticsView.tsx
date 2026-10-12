import React from 'react';
import { BarChart3, TrendingUp, PieChart, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { Transaction } from '../types';

interface AnalyticsViewProps {
  transactions: Transaction[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions }) => {
  // Compute Category Spend
  const categoryTotals: Record<string, number> = {};
  let totalDebitCents = 0;

  for (const t of transactions) {
    if (t.status === 'COMPLETED' && (t.type === 'BILL_PAY' || t.type === 'TRANSFER' || t.type === 'WITHDRAWAL')) {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amountCents;
      totalDebitCents += t.amountCents;
    }
  }

  const categoryList = Object.entries(categoryTotals)
    .map(([category, cents]) => ({
      category,
      cents,
      formatted: `$${(cents / 100).toFixed(2)}`,
      pct: totalDebitCents > 0 ? Math.round((cents / totalDebitCents) * 100) : 0
    }))
    .sort((a, b) => b.cents - a.cents);

  // Group by Month for Income vs Expense
  const monthlyData: Record<string, { month: string; income: number; expense: number }> = {};
  for (const t of transactions) {
    if (t.status !== 'COMPLETED') continue;
    const d = new Date(t.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (!monthlyData[key]) {
      monthlyData[key] = { month: label, income: 0, expense: 0 };
    }

    if (t.type === 'DEPOSIT' || t.type === 'INTEREST') {
      monthlyData[key].income += t.amountCents / 100;
    } else {
      monthlyData[key].expense += t.amountCents / 100;
    }
  }

  const months = Object.values(monthlyData);
  const maxMonthVal = Math.max(...months.flatMap((m) => [m.income, m.expense]), 1000);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Spending & Cash Flow Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Automated categorical reconciliation and multi-period budget trends
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Recorded Outflow</span>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            ${(totalDebitCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {transactions.filter((t) => t.status === 'COMPLETED').length} settled debits
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Spend Category</span>
          <h3 className="text-2xl font-bold tracking-tight text-teal-600 dark:text-teal-400 mt-1 truncate">
            {categoryList[0]?.category || 'Utilities & Bills'}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {categoryList[0]?.pct || 0}% of all outgoing expenditure
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average Savings Ratio</span>
          <h3 className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
            +41.8%
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Health benchmark: Optimal liquidity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Category Distribution */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Categorical Outflow Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of debited funds</p>
            </div>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-1">
            {categoryList.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.category}</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {item.formatted} ({item.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Income vs Expenses Comparison Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Inflow vs Outflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comparative multi-period cash flow</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Expenses
              </span>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            {months.map((m) => {
              const incomePct = Math.round((m.income / maxMonthVal) * 100);
              const expensePct = Math.round((m.expense / maxMonthVal) * 100);

              return (
                <div key={m.month} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span>{m.month}</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Net: +${(m.income - m.expense).toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {/* Income Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-12 text-slate-400">Inflow</span>
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${incomePct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 w-16 text-right">
                        ${m.income.toFixed(0)}
                      </span>
                    </div>

                    {/* Expense Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-12 text-slate-400">Outflow</span>
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${expensePct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 w-16 text-right">
                        ${m.expense.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
