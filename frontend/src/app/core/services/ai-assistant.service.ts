import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AIMessage } from '../models/notification.model';

export interface AIChatResponse {
  conversationId: string;
  message: AIMessage;
  metadata: {
    modelUsed: string;
    isSimulatedFallback: boolean;
    toolCalls?: {
      tool: string;
      params: Record<string, unknown>;
      resultSummary: string;
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AIAssistantService {
  private http = inject(HttpClient);

  messages = signal<AIMessage[]>([]);
  isLoading = signal<boolean>(false);
  activeModel = signal<string>('gemini-3.8-flash');

  loadConversationHistory(): Observable<{ conversation: { messages: AIMessage[] } }> {
    return this.http
      .get<{ conversation: { messages: AIMessage[] } }>('/api/v1/ai/conversations/default')
      .pipe(
        tap((res) => {
          if (res.conversation?.messages) {
            this.messages.set(res.conversation.messages);
          }
        })
      );
  }

  sendMessage(userQuery: string): Observable<AIChatResponse> {
    const userMsg: AIMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      content: userQuery,
      timestamp: new Date().toISOString()
    };

    this.messages.update((prev) => [...prev, userMsg]);
    this.isLoading.set(true);

    return this.http
      .post<AIChatResponse>('/api/v1/ai/chat', { message: userQuery })
      .pipe(
        tap({
          next: (res) => {
            this.messages.update((prev) => [...prev, res.message]);
            if (res.metadata?.modelUsed) {
              this.activeModel.set(res.metadata.modelUsed);
            }
            this.isLoading.set(false);
          },
          error: (err) => {
            const errorMsg: AIMessage = {
              id: `msg_err_${Date.now()}`,
              sender: 'assistant',
              content: `Error retrieving financial analysis: ${err.message || 'System busy'}.`,
              timestamp: new Date().toISOString()
            };
            this.messages.update((prev) => [...prev, errorMsg]);
            this.isLoading.set(false);
          }
        })
      );
  }
}
