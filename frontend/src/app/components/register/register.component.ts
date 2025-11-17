import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: User = {
    nome: '',
    cognome: '',
    email: '',
    password: '',
    ruolo: 'CLIENTE',
  };

  register() {
    this.authService.register(this.user).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      (error: { status: number; error: { message: string } }) => {
        console.error('Registration failed', error);
      },
    );
  }
}
