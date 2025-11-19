import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  profileForm: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor() {
    this.profileForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern('^[0-9]{10}$')]] // Simple 10 digit validation
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.apiService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile', err);
        this.errorMessage = 'Errore nel caricamento del profilo.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.successMessage = null;
      this.errorMessage = null;

      // Include disabled fields (email) if needed, but backend ignores email update for now
      const profileData = this.profileForm.getRawValue();

      this.apiService.updateProfile(profileData).subscribe({
        next: (updatedProfile) => {
          this.profileForm.patchValue(updatedProfile);
          this.successMessage = 'Profilo aggiornato con successo!';
          this.isLoading = false;
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (err) => {
          console.error('Error updating profile', err);
          this.errorMessage = 'Errore durante l\'aggiornamento.';
          this.isLoading = false;
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
