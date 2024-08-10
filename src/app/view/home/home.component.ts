import {Component} from '@angular/core';
import {UserRole} from "../../shared/constant/userRole";
import {ActiveUserRoleService} from "../../service/activeUserRoleServie";
import {AppointmentService} from "../../service/appointment.service";
import {Appointment} from "../../entity/appointment";
import {Staff} from "../../entity/staff";
import {AuthorizationManager} from "../../service/authorizationmanager";
import {User1} from "../../entity/user1";
import {User1Service} from "../../service/user1service";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  appointments: Array<Appointment> = [];

  upcomings: Array<Appointment> = [];

  protected readonly UserRole = UserRole;

  constructor(public aur: ActiveUserRoleService, private as: AppointmentService, private authService: AuthorizationManager, private us: User1Service) {
    this.getUser();
  }

  getDashBoardDetailsAll(): void {
    this.as.getAllOnGoingSchedules()
      .then((appointments: Appointment[]) => {
        this.appointments = appointments;
      })
      .catch((error) => {
        console.log(error);
      })
  }

  ngOnInit(): void {
    if (this.aur.getUserRole() == UserRole.Admin || this.aur.getUserRole() == UserRole.Receptionist || this.aur.getUserRole() == UserRole.CounterClerk) {
    setInterval(() => {
      this.getDashBoardDetailsAll();
    }, 18000);
    }
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

  getUser() {
    this.us.get(this.authService.getUsername()).then((stf: Staff | undefined) => {      // @ts-ignore
      this.aur.setUserRole(stf.staffType.type);
      this.aur.setStaff(stf);
      if (this.aur.getUserRole() == UserRole.Admin || this.aur.getUserRole() == UserRole.Receptionist || this.aur.getUserRole() == UserRole.CounterClerk){
        this.getDashBoardDetailsAll();
      }else{
        let query = "";
        if (this.authService.getUsername() != null && this.authService.getUsername().trim() != "") query = query + "&username=" + this.authService.getUsername();
        if (query != "") query = query.replace(/^./, "?");
        this.as.getMyCurrentScheduleAppointments(query)
          .then((appointments: Appointment[]) => {
            if (appointments && appointments.length > 0) {
              // Add the last appointment from the list
              const lastAppointment = appointments[appointments.length - 1];
              this.appointments.push(lastAppointment);
            } else {
              console.warn('No appointments found or appointments is undefined');
            }
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {

          });
        this.as.findMyUpcomingScheduleAppointments(query)
          .then((appointments: Appointment[]) => {
            if (appointments && appointments.length > 0) {
              // Add the last appointment from the list
              const lastAppointment = appointments[appointments.length - 1];
              this.upcomings = appointments;
            } else {
              console.warn('No appointments found or appointments is undefined');
            }
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {

          });
      }
    });
  }
}
