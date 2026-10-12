import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'nb_auth_token';

  // Angular Signals for reactive auth state
  currentUser = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  isAuthenticated = computed(() => !!this.currentUser());
  userRoles = computed(() => this.currentUser()?.roles || []);
  isStaff = computed(() => {
    const roles = this.userRoles();
    return roles.includes('ADMIN') || roles.includes('COMPLIANCE_OFFICER') || roles.includes('SUPPORT_AGENT');
  });

  constructor() {
    this.initSession();
  }

  private initSession(): void {
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    if (savedToken) {
      this.token.set(savedToken);
    }
    this.fetchCurrentUser().subscribe();
  }

  fetchCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>('/api/v1/auth/me').pipe(
      tap((res) => {
        this.currentUser.set(res.user);
      }),
      catchError((err) => {
        this.currentUser.set(null);
        return throwError(() => err);
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/login', { email, password }).pipe(
      tap((res) => {
        this.setSession(res.token, res.user);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/register', { name, email, password }).pipe(
      tap((res) => {
        this.setSession(res.token, res.user);
      })
    );
  }

  switchDemoPersona(role: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/switch-demo-persona', { role }).pipe(
      tap((res) => {
        this.setSession(res.token, res.user);
      })
    );
  }

  logout(): void {
    this.http.post('/api/v1/auth/logout', {}).subscribe();
    this.clearSession();
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);
    this.currentUser.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }
}
