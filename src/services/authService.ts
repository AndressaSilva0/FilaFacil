import { api } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: string;
  unit?: string;
  phone?: string;
  registrationNumber?: string;
  avatarUrl?: string;
}

export interface LoginParams {
  identifier?: string;
  cpf?: string;
  email?: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterParams {
  name: string;
  cpf: string;
  email: string;
  password: string;
  role?: string;
  unit?: string;
  phone?: string;
  registrationNumber?: string;
  acceptedTerms: boolean;
}

const STORAGE_KEYS = {
  TOKEN: 'filafacil_token',
  USER: 'filafacil_user',
  REMEMBER: 'filafacil_remember',
};

class AuthService {
  public getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  public getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw || raw === 'undefined' || raw === 'null' || raw.trim() === '') return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public async login(params: LoginParams): Promise<{ user: AuthUser; token: string }> {
    const response = await api.post<any>('/auth/login', {
      identifier: params.identifier || params.cpf || params.email,
      cpf: params.cpf,
      email: params.email,
      password: params.password,
      rememberMe: params.rememberMe ?? true,
    });

    const user: AuthUser = response.user || response.profile || response;
    const token: string = response.token;

    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
    if (user && typeof user === 'object') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    if (params.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
    }

    return { user, token };
  }

  public async register(params: RegisterParams): Promise<{ user: AuthUser; token: string }> {
    const response = await api.post<any>('/auth/register', params);

    const user: AuthUser = response.user || response.profile || response;
    const token: string = response.token;

    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
    if (user && typeof user === 'object') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    return { user, token };
  }

  public async forgotPassword(identifier: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/forgot-password', { identifier });
  }

  public async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  }

  public async getProfile(): Promise<AuthUser> {
    const response = await api.get<any>('/users/profile');
    const user: AuthUser = response.user || response.profile || response;
    if (user && typeof user === 'object' && user.name) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    return user;
  }

  public async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    const response = await api.put<any>('/users/profile', data);
    const user: AuthUser = response.user || response.profile || response;
    if (user && typeof user === 'object' && user.name) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    return user;
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return api.put<{ message: string }>('/users/change-password', { currentPassword, newPassword });
  }

  public async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.upload<any>('/users/avatar', formData);
    const avatarUrl = response.avatarUrl || response.url || '';

    const currentUser = this.getCurrentUser();
    if (currentUser && avatarUrl) {
      currentUser.avatarUrl = avatarUrl;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    }

    return avatarUrl;
  }

  public logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  }
}

export const authService = new AuthService();

