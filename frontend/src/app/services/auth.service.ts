import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { User } from '../models/user.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/auth`;

  private readonly tokenKey = 'token';
  private readonly roleKey = 'userRole';
  private readonly userIdKey = 'userId';

  private loggedIn = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLoggedIn$ = this.loggedIn.asObservable();

  private adminSubject = new BehaviorSubject<boolean>(this.checkIsAdmin());
  public isAdmin$ = this.adminSubject.asObservable();

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

    this.updateState();
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
    this.updateState();
  }

  isAdminAuthenticated(): boolean {
    return this.checkIsAdmin();
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const decoded = this.safeDecode(token);
    return !!decoded && !this.isExpired(decoded);
  }

  private checkIsAdmin(): boolean {
    if (!this.hasValidToken()) return false;
    const decoded = this.getDecodedToken();
    return decoded?.role === 'ADMIN';
  }

  private updateState(): void {
    this.loggedIn.next(this.hasValidToken());
    this.adminSubject.next(this.checkIsAdmin());
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
