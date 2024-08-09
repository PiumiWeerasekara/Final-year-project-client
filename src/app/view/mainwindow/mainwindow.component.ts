import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthorizationManager} from "../../service/authorizationmanager";
import {DarkModeService} from "../../service/DarkModeService";
import {Gender} from "../../entity/gender";
import {User1Service} from "../../service/user1service";
import {Staff} from "../../entity/staff";
import {UserRole} from "../../shared/constant/userRole";
import {ActiveUserRoleService} from "../../service/activeUserRoleServie";
import {DatePipe} from "@angular/common";


@Component({
  selector: 'app-mainwindow',
  templateUrl: './mainwindow.component.html',
  styleUrls: ['./mainwindow.component.css']
})
export class MainwindowComponent {

  opened: boolean = true;

  staff!: Staff;
  //userRole!: string;
  currentDate=new Date();
  imageUrl!: string;


  constructor(private router: Router, public authService: AuthorizationManager, public darkModeSevice: DarkModeService, private us: User1Service, public aur: ActiveUserRoleService, public dp: DatePipe) {
    this.getUser();
  }

  ngOnInit(): void {
    this.startLiveDateTime();
  }


  startLiveDateTime(): void {
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  logout(): void {
    this.router.navigateByUrl("login")
    this.authService.clearUsername();
    this.authService.clearButtonState();
    this.authService.clearMenuState();
    localStorage.removeItem("Authorization");
  }

  admMenuItems = this.authService.admMenuItems;
  acdMenuItems = this.authService.acdMenuItems;
  regMenuItems = this.authService.regMenuItems;
  clsMenuItems = this.authService.clsMenuItems;

  isMenuVisible(category: string): boolean {
    switch (category) {
      case 'Admin':
        return this.admMenuItems.some(menuItem => menuItem.accessFlag);
      case 'Academic':
        return this.acdMenuItems.some(menuItem => menuItem.accessFlag);
      case 'Registration':
        return this.regMenuItems.some(menuItem => menuItem.accessFlag);
      case 'Class':
        return this.clsMenuItems.some(menuItem => menuItem.accessFlag);
      default:
        return false;
    }
  }

  getUser() {
    this.us.get(this.authService.getUsername()).then((stf: Staff | undefined) => {
      if (stf != undefined){
        this.staff = stf;
        if (this.staff.photo) {
          this.imageUrl = 'data:image/jpeg;base64,' + atob(this.staff.photo);
        } else {
          this.imageUrl = 'assets/user.png'; // Default image
        }
      }

      // @ts-ignore
      this.aur.setUserRole(stf.staffType.type);
      this.aur.setStaff(stf);
      //this.userRole = stf.staffType.type;
    });
  }

  protected readonly UserRole = UserRole;
}
