import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { User, Account, Transaction, Beneficiary, Notification, AIMessage } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AccountsView } from './components/AccountsView';
import { TransfersView } from './components/TransfersView';
import { BeneficiariesView } from './components/BeneficiariesView';
import { TransactionsView } from './components/TransactionsView';
import { AnalyticsView } from './components/AnalyticsView';
import { AIAssistantView } from './components/AIAssistantView';
import { AdminPortalView } from './components/AdminPortalView';
import { ApiDocsView } from './components/ApiDocsView';
import { AngularExplorerView } from './components/AngularExplorerView';
import { ReceiptModal } from './components/ReceiptModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // App state
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // UI state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isConnectedSSE, setIsConnectedSSE] = useState<boolean>(false);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<Transaction | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `tst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Initial Load
  const fetchAllBankingData = useCallback(async () => {
    try {
      const [userData, accData, txnData, benData, notifData, aiConv] = await Promise.all([
        api.getMe(),
        api.getAccounts(),
        api.getTransactions({ limit: '100' }),
        api.getBeneficiaries(),
        api.getNotifications(),
        api.getAIConversation().catch(() => ({ conversation: { messages: [] } }))
      ]);

      setUser(userData.user);
      setAccounts(accData.accounts);
      setTransactions(txnData.transactions);
      setBeneficiaries(benData.beneficiaries);
      setNotifications(notifData.notifications);
      setUnreadCount(notifData.unreadCount);
      if (aiConv.conversation?.messages) {
        setAiMessages(aiConv.conversation.messages);
      }
    } catch (err) {
      console.error('[App] Error fetching initial banking state:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllBankingData();
  }, [fetchAllBankingData]);

  // Connect Server-Sent Events (SSE) Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/v1/events');

        eventSource.onopen = () => {
          setIsConnectedSSE(true);
        };

        eventSource.addEventListener('TRANSACTION_CREATED', (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload?.data?.transaction) {
              const newTxn: Transaction = payload.data.transaction;
              setTransactions((prev) => [newTxn, ...prev.filter((t) => t.id !== newTxn.id)]);

              // Update account balances
              if (payload.data.sourceAccount) {
                setAccounts((prev) =>
                  prev.map((a) => (a.id === payload.data.sourceAccount.id ? payload.data.sourceAccount : a))
                );
              }
              if (payload.data.destinationAccount) {
                setAccounts((prev) =>
                  prev.map((a) => (a.id === payload.data.destinationAccount.id ? payload.data.destinationAccount : a))
                );
              }

              // Update notification
              if (payload.data.notification) {
                setNotifications((prev) => [payload.data.notification, ...prev]);
                setUnreadCount((c) => c + 1);
              }

              addToast({
                type: 'success',
                title: 'Transfer Real-Time Update',
                message: `$${(newTxn.amountCents / 100).toFixed(2)} sent to ${newTxn.beneficiaryName || 'payee'}.`
              });
            }
          } catch (err) {
            console.error('[SSE] Failed to parse transaction event:', err);
          }
        });

        eventSource.onerror = () => {
          setIsConnectedSSE(false);
          eventSource?.close();
          // Auto-reconnect after 4s
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch (err) {
        console.error('[SSE] Connection initialization failed:', err);
        setIsConnectedSSE(false);
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, [addToast]);

  // Persona Switch Handler
  const handleSwitchPersona = async (role: string) => {
    try {
      const res = await api.switchDemoPersona(role);
      setUser(res.user);
      addToast({
        type: 'info',
        title: 'Switched Persona Role',
        message: `Active persona updated to ${res.user.name} (${role}).`
      });
      // Refresh user-scoped data
      await fetchAllBankingData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Persona Switch Error',
        message: err.message || 'Failed to switch demo persona.'
      });
    }
  };

  // Transfer Execution Handler
  const handleExecuteTransfer = async (payload: any) => {
    try {
      const res = await api.executeTransfer(payload);
      if (res.success && res.transaction) {
        addToast({
          type: 'success',
          title: 'Transfer Committed',
          message: `Ref: ${res.transaction.transactionReference} committed to bank ledger.`
        });
        await fetchAllBankingData();
        return { success: true, transaction: res.transaction };
      }
      return { success: false, error: res.message || 'Transfer failed.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Add Beneficiary Handler
  const handleAddBeneficiary = async (data: any) => {
    try {
      const res = await api.addBeneficiary(data);
      if (res.success && res.beneficiary) {
        setBeneficiaries((prev) => [...prev, res.beneficiary]);
        addToast({
          type: 'success',
          title: 'Beneficiary Registered',
          message: `${res.beneficiary.displayName} added with 2-hour security cooldown.`
        });
        return { success: true, beneficiary: res.beneficiary };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Delete Beneficiary Handler
  const handleDeleteBeneficiary = async (id: string) => {
    try {
      await api.deleteBeneficiary(id);
      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
      addToast({
        type: 'info',
        title: 'Payee Removed',
        message: 'Beneficiary record deactivated.'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Could not delete payee.'
      });
    }
  };

  // AI Chat Handler
  const handleSendMessage = async (text: string) => {
    const userMsg: AIMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setAiMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const res = await api.chatAI(text);
      if (res.message) {
        setAiMessages((prev) => [...prev, res.message]);
      }
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        content: `I encountered an unexpected issue retrieving your banking context: ${err.message}. Please try again.`,
        timestamp: new Date().toISOString()
      };
      setAiMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Notifications Handlers
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const totalAvailableCents = accounts.reduce((sum, a) => sum + a.availableBalanceCents, 0);
  const totalAvailableFormatted = `$${(totalAvailableCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Official Transaction Receipt Modal */}
      {selectedReceiptTxn && (
        <ReceiptModal
          transaction={selectedReceiptTxn}
          onClose={() => setSelectedReceiptTxn(null)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRoles={user?.roles || ['CUSTOMER']}
        totalAvailableFormatted={totalAvailableFormatted}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          user={user}
          onSwitchPersona={handleSwitchPersona}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onOpenTransferModal={() => setCurrentTab('transfers')}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          isConnectedSSE={isConnectedSSE}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              accounts={accounts}
              transactions={transactions}
              onOpenTransfer={() => setCurrentTab('transfers')}
              onOpenBeneficiaries={() => setCurrentTab('beneficiaries')}
              onOpenAssistant={() => setCurrentTab('ai-assistant')}
              onOpenTransactions={() => setCurrentTab('transactions')}
              onSelectTransaction={(txn) => setSelectedReceiptTxn(txn)}
            />
          )}

          {currentTab === 'accounts' && (
            <AccountsView
              accounts={accounts}
              onOpenTransfer={() => setCurrentTab('transfers')}
            />
          )}

          {currentTab === 'transfers' && (
            <TransfersView
              accounts={accounts}
              beneficiaries={beneficiaries}
              onExecuteTransfer={handleExecuteTransfer}
              onViewReceipt={(txn) => setSelectedReceiptTxn(txn)}
            />
          )}

          {currentTab === 'beneficiaries' && (
            <BeneficiariesView
              beneficiaries={beneficiaries}
              onAddBeneficiary={handleAddBeneficiary}
              onDeleteBeneficiary={handleDeleteBeneficiary}
              onSelectPayeeForTransfer={() => setCurrentTab('transfers')}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              onSelectTransaction={(txn) => setSelectedReceiptTxn(txn)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView transactions={transactions} />
          )}

          {currentTab === 'ai-assistant' && (
            <AIAssistantView
              messages={aiMessages}
              onSendMessage={handleSendMessage}
              isLoading={isAiLoading}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPortalView userRoles={user?.roles || []} />
          )}

          {currentTab === 'angular-code' && (
            <AngularExplorerView />
          )}

          {currentTab === 'architecture-docs' && (
            <ApiDocsView />
          )}
        </main>
      </div>
    </div>
  );
}
