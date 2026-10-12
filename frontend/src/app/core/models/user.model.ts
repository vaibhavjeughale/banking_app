export type UserRole = 'CUSTOMER' | 'SUPPORT_AGENT' | 'COMPLIANCE_OFFICER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'FLAGGED';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}
