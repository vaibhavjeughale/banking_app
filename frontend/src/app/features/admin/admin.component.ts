import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);

  overview = signal<any>(null);
  users = signal<any[]>([]);
  auditLogs = signal<any[]>([]);
  activeTab = signal<'overview' | 'users' | 'audit'>('overview');

  ngOnInit(): void {
    this.http.get('/api/v1/admin/overview').subscribe((data) => this.overview.set(data));
    this.http.get<{ users: any[] }>('/api/v1/admin/users').subscribe((data) => this.users.set(data.users));
    this.http.get<{ logs: any[] }>('/api/v1/admin/audit-logs').subscribe((data) => this.auditLogs.set(data.logs));
  }

  toggleUserStatus(userId: string, currentStatus: string): void {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.http.patch(`/api/v1/admin/users/${userId}/status`, { status: nextStatus }).subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
      }
    });
  }
}
