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
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public async login(params: LoginParams): Promise<{ user: AuthUser; token: string }> {
    const response = await api.post<{ message: string; token: string; user: AuthUser }>('/auth/login', {
      identifier: params.identifier || params.cpf || params.email,
      cpf: params.cpf,
      email: params.email,
      password: params.password,
      rememberMe: params.rememberMe ?? true,
    });

    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    if (params.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
    }

    return { user: response.user, token: response.token };
  }

  public async register(params: RegisterParams): Promise<{ user: AuthUser; token: string }> {
    const response = await api.post<{ message: string; token: string; user: AuthUser }>('/auth/register', params);

    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

    return { user: response.user, token: response.token };
  }

  public async forgotPassword(identifier: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/forgot-password', { identifier });
  }

  public async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/auth/reset-password', { token, newPassword });
  }

  public async getProfile(): Promise<AuthUser> {
    const response = await api.get<{ user: AuthUser }>('/users/profile');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    return response.user;
  }

  public async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    const response = await api.put<{ message: string; user: AuthUser }>('/users/profile', data);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    return response.user;
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return api.put<{ message: string }>('/users/change-password', { currentPassword, newPassword });
  }

  public async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.upload<{ message: string; avatarUrl: string }>('/users/avatar', formData);

    const currentUser = this.getCurrentUser();
    if (currentUser) {
      currentUser.avatarUrl = response.avatarUrl;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    }

    return response.avatarUrl;
  }

  public logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
  }
}

export const authService = new AuthService();

