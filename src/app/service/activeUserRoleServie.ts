import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActiveUserRoleService {
  private userRole: string | undefined;

  setUserRole(role: string): void {
    this.userRole = role;
  }

  getUserRole(): string | undefined {
    return this.userRole;
  }
}
