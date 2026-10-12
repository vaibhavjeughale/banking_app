import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BankingService } from './core/services/banking.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  bankingService = inject(BankingService);

  title = 'NexaBank AI';
  isSidebarOpen = signal<boolean>(false);
  isDarkMode = signal<boolean>(false);
  showPersonaMenu = signal<boolean>(false);
  showNotifications = signal<boolean>(false);

  personas = [
    { role: 'CUSTOMER', name: 'Alex Morgan', desc: 'Customer · Everyday Accounts' },
    { role: 'SUPPORT_AGENT', name: 'Sarah Jenkins', desc: 'Support Agent · Client Service' },
    { role: 'COMPLIANCE_OFFICER', name: 'Elena Rostova', desc: 'Compliance Officer · Risk & AML' },
    { role: 'ADMIN', name: 'Marcus Vance', desc: 'Administrator · System Ops' }
  ];

  ngOnInit(): void {
    this.bankingService.loadInitialState();
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  toggleDarkMode(): void {
    this.isDarkMode.update((dark) => {
      const next = !dark;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }

  selectPersona(role: string): void {
    this.bankingService.switchDemoPersona(role).subscribe({
      next: () => this.showPersonaMenu.set(false)
    });
  }

  markNotificationRead(id: string): void {
    this.bankingService.markNotificationRead(id).subscribe();
  }
}
