import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-bottom-nav',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './bottom-nav.component.html',
    styleUrls: ['./bottom-nav.component.css']
})
export class BottomNavComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    isLoggedIn$ = this.authService.isLoggedIn$;
    isAdmin$ = this.authService.isAdmin$;

    // Helper to check if a route is active
    isActive(route: string): boolean {
        return this.router.url.includes(route);
    }
}
