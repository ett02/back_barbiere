import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/auth';

  private readonly tokenKey = 'token';
  private readonly roleKey = 'userRole';
  private readonly userIdKey = 'userId';

  login(credentials: { email: string; password: string }): Observable<{ jwt: string }> {
    return this.http.post<{ jwt: string }>(`${this.apiUrl}/login`, credentials);
  }

  public getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  saveSession(token: string): DecodedToken | null {
    localStorage.setItem(this.tokenKey, token);

    const decoded = this.safeDecode(token);
    if (!decoded) {
      this.clearSession();
      return null;
    }

    if (decoded.role) {
      localStorage.setItem(this.roleKey, decoded.role);
    } else {
      localStorage.removeItem(this.roleKey);
    }

    if (typeof decoded.id === 'number') {
      localStorage.setItem(this.userIdKey, decoded.id.toString());
    } else {
      localStorage.removeItem(this.userIdKey);
    }

    return decoded;
  }

  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const decoded = this.safeDecode(token);
    if (!decoded) {
      this.clearSession();
    }
    return decoded;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    this.clearSession();
  }

  isAdminAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const decoded = this.safeDecode(token);
    if (!decoded) {
      this.clearSession();
      return false;
    }

    if (this.isExpired(decoded)) {
      this.clearSession();
      return false;
    }

    return decoded.role === 'ADMIN';
  }

  private isExpired(decoded: DecodedToken): boolean {
    if (!decoded.exp) {
      return false;
    }
    const expiration = decoded.exp * 1000;
    return Date.now() >= expiration;
  }

  private safeDecode(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Failed to decode token', error);
      return null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem('user');
  }
}

type DecodedToken = JwtPayload & { sub?: string; role?: string; id?: number };
