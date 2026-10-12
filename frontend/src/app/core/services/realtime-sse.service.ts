import { Injectable, signal, inject, NgZone, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { Account } from '../models/account.model';
import { Notification } from '../models/notification.model';

export interface BankRealtimeEvent {
  type: string;
  userId: string;
  data: {
    transaction?: Transaction;
    notification?: Notification;
    sourceAccount?: Account;
    destinationAccount?: Account;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeSseService implements OnDestroy {
  private zone = inject(NgZone);
  private eventSource: EventSource | null = null;
  private reconnectTimer: any = null;

  isConnected = signal<boolean>(false);
  private eventsSubject = new Subject<BankRealtimeEvent>();

  events$: Observable<BankRealtimeEvent> = this.eventsSubject.asObservable();

  constructor() {
    this.connect();
  }

  connect(): void {
    if (typeof EventSource === 'undefined') return;

    try {
      this.eventSource = new EventSource('/api/v1/events');

      this.eventSource.onopen = () => {
        this.zone.run(() => {
          this.isConnected.set(true);
        });
      };

      this.eventSource.addEventListener('TRANSACTION_CREATED', (e: MessageEvent) => {
        this.zone.run(() => {
          try {
            const eventPayload: BankRealtimeEvent = JSON.parse(e.data);
            this.eventsSubject.next(eventPayload);
          } catch (err) {
            console.error('[SSE Angular] Failed to parse transaction event:', err);
          }
        });
      });

      this.eventSource.onerror = () => {
        this.zone.run(() => {
          this.isConnected.set(false);
          this.eventSource?.close();
          this.reconnectTimer = setTimeout(() => this.connect(), 4000);
        });
      };
    } catch (err) {
      console.error('[SSE Angular] Connection failed:', err);
      this.isConnected.set(false);
    }
  }

  ngOnDestroy(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.eventSource?.close();
  }
}
