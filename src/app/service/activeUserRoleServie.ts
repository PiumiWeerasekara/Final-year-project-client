import {Injectable} from '@angular/core';
import {Staff} from "../entity/staff";

@Injectable({
  providedIn: 'root'
})
export class ActiveUserRoleService {
  private userRole: string | undefined;

  private staff: Staff | undefined;

  private charges: number = 600;

  setUserRole(role: string): void {
    this.userRole = role;
  }

  getUserRole(): string | undefined {
    return this.userRole;
  }

  getStaff(): Staff | undefined {
    return this.staff;
  }

  setStaff(value: Staff | undefined) {
    this.staff = value;
  }

  getCharges(): number {
    return this.charges;
  }

  setCharges(value: number) {
    this.charges = value;
  }
}
