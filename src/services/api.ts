import {
  User,
  Account,
  Transaction,
  Beneficiary,
  Notification,
  AuditLog,
  AIMessage
} from '../types';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('nb_auth_token');
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem('nb_auth_token', token);
  }

  public getToken(): string | null {
    return this.token;
  }

  public clearToken() {
    this.token = null;
    localStorage.removeItem('nb_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`/api/v1${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  // Auth
  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  public async switchDemoPersona(role: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/switch-demo-persona', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    this.setToken(res.token);
    return res;
  }

  public async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.token);
    return res;
  }

  public async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    this.setToken(res.token);
    return res;
  }

  // Accounts
  public async getAccounts(): Promise<{ accounts: Account[] }> {
    return this.request<{ accounts: Account[] }>('/accounts');
  }

  public async getAccountSummary(accountId: string): Promise<any> {
    return this.request(`/accounts/${accountId}/summary`);
  }

  // Transactions
  public async getTransactions(params: Record<string, string> = {}): Promise<{
    transactions: Transaction[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions${query ? `?${query}` : ''}`);
  }

  public async executeTransfer(payload: {
    sourceAccountId: string;
    destinationAccountId?: string;
    beneficiaryId?: string;
    customBeneficiary?: { displayName: string; accountNumber: string; bankName: string };
    amountCents: number;
    description: string;
    category?: string;
    idempotencyKey?: string;
  }): Promise<{ success: boolean; transaction: Transaction; message: string }> {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async getReceipt(transactionId: string): Promise<{ receipt: any }> {
    return this.request(`/transactions/${transactionId}/receipt`);
  }

  // Beneficiaries
  public async getBeneficiaries(): Promise<{ beneficiaries: Beneficiary[] }> {
    return this.request<{ beneficiaries: Beneficiary[] }>('/beneficiaries');
  }

  public async addBeneficiary(payload: {
    displayName: string;
    accountNumber: string;
    bankName: string;
    routingCode?: string;
  }): Promise<{ success: boolean; beneficiary: Beneficiary }> {
    return this.request('/beneficiaries', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  public async deleteBeneficiary(id: string): Promise<{ success: boolean }> {
    return this.request(`/beneficiaries/${id}`, {
      method: 'DELETE'
    });
  }

  // Analytics
  public async getSpendingAnalytics(): Promise<any> {
    return this.request('/analytics/spending');
  }

  public async getMonthlyAnalytics(): Promise<any> {
    return this.request('/analytics/monthly-summary');
  }

  // Notifications
  public async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.request('/notifications');
  }

  public async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  public async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request('/notifications/mark-all-read', {
      method: 'POST'
    });
  }

  // AI Assistant
  public async chatAI(message: string, conversationId?: string): Promise<{
    conversationId: string;
    message: AIMessage;
    metadata: {
      modelUsed: string;
      isSimulatedFallback: boolean;
      toolCalls?: any[];
    };
  }> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId })
    });
  }

  public async getAIConversation(): Promise<{ conversation: { messages: AIMessage[] } }> {
    return this.request('/ai/conversations/default');
  }

  // Admin & Operations
  public async getAdminOverview(): Promise<any> {
    return this.request('/admin/overview');
  }

  public async getAdminUsers(): Promise<{ users: any[] }> {
    return this.request('/admin/users');
  }

  public async updateAdminUserStatus(userId: string, status: string): Promise<any> {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  public async getAdminAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return this.request('/admin/audit-logs');
  }

  public async getAdminSystemHealth(): Promise<any> {
    return this.request('/admin/system-health');
  }

  // OpenAPI spec
  public async getOpenApiSpec(): Promise<any> {
    return this.request('/docs');
  }
}

export const api = new ApiService();
