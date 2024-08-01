import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./view/login/login.component";
import {MainwindowComponent} from "./view/mainwindow/mainwindow.component";
import {EmployeeComponent} from "./view/modules/employee/employee.component";
import {HomeComponent} from "./view/home/home.component";
import {UserComponent} from "./view/modules/user/user.component";
import {CountByDesignationComponent} from "./report/view/countbydesignation/countbydesignation.component";
import {ArrearsByProgramComponent} from "./report/view/arrearsbyprogram/arrearsbyprogram.component";
import {PrivilageComponent} from "./view/modules/privilage/privilage.component";
import {OperationComponent} from "./view/modules/operation/operation.component";
import {AttendanceComponent} from "./view/modules/attendance/attendance.component";
import {PaymentComponent} from "./view/modules/payment/payment.component";
import {StudentComponent} from "./view/modules/student/student.component";
import {BatchregistrationComponent} from "./view/modules/batchregistration/batchregistration.component";
import {ClassComponent} from "./view/modules/class/class.component";
import {BookdistributionComponent} from "./view/modules/bookdistribution/bookdistribution.component";
import {DoctorComponent} from "./view/modules/doctor/doctor.component";
import {PatientComponent} from "./view/modules/patient/patient.component";
import {RoomComponent} from "./view/modules/room/room.component";
import {ScheduleComponent} from "./view/modules/schedule/schedule.component";
import {AppointmentComponent} from "./view/modules/appointment/appointment.component";

const routes: Routes = [
  {path: "login", component: LoginComponent},
  {path: "", redirectTo: 'login', pathMatch: 'full'},
  {
    path: "main",
    component: MainwindowComponent,
    children: [
      {path: "home", component: HomeComponent},
      {path: "employee", component: EmployeeComponent},
      {path: "user", component: UserComponent},
      {path:"reports", component: ArrearsByProgramComponent},
      {path:"payments",component:PaymentComponent},
      {path: "home/payments", redirectTo: 'payments', pathMatch: 'full'},
      {path:"batchregistration",component:BatchregistrationComponent},
      {path: "home/batchregistration", redirectTo: 'batchregistration', pathMatch: 'full'},
      {path:"students",component:StudentComponent},
      {path: "home/students", redirectTo: 'students', pathMatch: 'full'},
      {path:"class",component:ClassComponent},
      {path: "home/class", redirectTo: 'class', pathMatch: 'full'},
      {path:"books",component:BookdistributionComponent},
      {path: "home/books", redirectTo: 'books', pathMatch: 'full'},
      {path:"attendance",component:AttendanceComponent},
      {path: "home/attendance", redirectTo: 'attendance', pathMatch: 'full'},
      {path: "doctor",component:DoctorComponent},
      {path: "patient",component:PatientComponent},
      {path: "room",component:RoomComponent},
      {path: "schedule",component:ScheduleComponent},
      {path: "appointment",component:AppointmentComponent},

    ]
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
