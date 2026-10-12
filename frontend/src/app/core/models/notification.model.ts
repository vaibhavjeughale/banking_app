export interface Notification {
  id: string;
  userId: string;
  type: 'TRANSFER_SUCCESS' | 'TRANSFER_FAILED' | 'SECURITY_ALERT' | 'ACCOUNT_UPDATE' | 'SYSTEM';
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCalls?: {
    name: string;
    params: Record<string, unknown>;
    result?: unknown;
  }[];
}
