import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    email: '',
    password: '',
  };
  errorMessage = '';

  login() {
    console.log('Sending login request with:', this.credentials);
    this.authService.login(this.credentials).subscribe(
      (response: { jwt: string }) => {
        console.log('Login successful - Full response:', response);
        console.log('JWT from response:', response.jwt);

        if (!response.jwt) {
          console.error('No JWT in response!');
          alert('Errore: JWT mancante nella risposta');
          return;
        }

        const decodedToken = this.authService.saveSession(response.jwt);
        if (!decodedToken) {
          alert('Errore durante il salvataggio della sessione. Effettua nuovamente il login.');
          return;
        }
        console.log('Decoded token:', decodedToken);

        if (!decodedToken || !decodedToken.role) {
          console.error('Cannot decode token or role missing');
          alert('Errore: impossibile decodificare il token');
          return;
        }

        if (decodedToken.role === 'ADMIN') {
          console.log('Navigating to admin-dashboard');
          this.router.navigate(['/admin-dashboard']);
        } else {
          console.log('Navigating to customer-dashboard');
          this.router.navigate(['/customer-dashboard']);
        }
      },
      (error: { status: number; error: { message: string } }) => {
        console.error('Login failed - Full error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error);
        this.errorMessage = 'Credenziali non valide';
        alert('Login fallito: ' + (error.error?.message || 'Credenziali errate'));
      },
    );
  }
}
