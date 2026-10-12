import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AIMessage } from '../models/banking.models';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/ai';

  messages = signal<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Hello! I am **NexaBank AI**, your personal financial assistant. I have read-only access to your accounts and can summarize spending, search transactions, or review balances. How can I help you today?',
      timestamp: new Date().toISOString()
    }
  ]);

  isLoading = signal<boolean>(false);

  sendMessage(messageText: string): Observable<any> {
    const userMsg: AIMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    this.messages.update((prev) => [...prev, userMsg]);
    this.isLoading.set(true);

    return this.http.post<any>(`${this.apiUrl}/chat`, { message: messageText }).pipe(
      tap({
        next: (res) => {
          if (res.message) {
            this.messages.update((prev) => [...prev, res.message]);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.messages.update((prev) => [
            ...prev,
            {
              id: `err_${Date.now()}`,
              sender: 'assistant',
              content: `Error: Unable to process your query (${err.error?.message || err.message}). Please try again.`,
              timestamp: new Date().toISOString()
            }
          ]);
          this.isLoading.set(false);
        }
      })
    );
  }
}
