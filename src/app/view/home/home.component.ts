import {Component} from '@angular/core';
import {UserRole} from "../../shared/constant/userRole";
import {ActiveUserRoleService} from "../../service/activeUserRoleServie";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(public aur: ActiveUserRoleService) {

  }


  userspecmessages: any[] = [
    {name: 'ashan.d@earth.lk', updated: new Date('5/30/23')},
    {name: 'rukmal.d@earth.lk', updated: new Date('5/17/23')},
    {name: 'it@earth.lk', updated: new Date('5/28/23')},
    {name: 'it@earth.lk', updated: new Date('4/28/23')},
  ];

  generalmessages: any[] = [
    {name: 'hr@earth.lk', updated: new Date('5/30/23')},
    {name: 'admin@earth.lk', updated: new Date('5/17/23')},
    {name: 'it@earth.lk', updated: new Date('5/28/23')},
    {name: 'it@earth.lk', updated: new Date('4/28/23')}
  ];
    protected readonly UserRole = UserRole;
}
