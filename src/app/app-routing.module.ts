import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./view/login/login.component";
import {MainwindowComponent} from "./view/mainwindow/mainwindow.component";
import {HomeComponent} from "./view/home/home.component";
import {CountByDesignationComponent} from "./report/view/countbydesignation/countbydesignation.component";
import {ArrearsByProgramComponent} from "./report/view/arrearsbyprogram/arrearsbyprogram.component";
import {PrivilageComponent} from "./view/modules/privilage/privilage.component";
import {PaymentComponent} from "./view/modules/payment/payment.component";
import {DoctorComponent} from "./view/modules/doctor/doctor.component";
import {PatientComponent} from "./view/modules/patient/patient.component";
import {RoomComponent} from "./view/modules/room/room.component";
import {ScheduleComponent} from "./view/modules/schedule/schedule.component";
import {AppointmentComponent} from "./view/modules/appointment/appointment.component";
import {PrescriptionComponent} from "./view/modules/prescription/prescription.component";
import {StaffComponent} from "./view/modules/staff/staff.component";
import {User1Component} from "./view/modules/user1/user1.component";
import {PrescriptionHistoryComponent} from "./view/modules/Reports/prescription-history/prescription-history.component";
import {PatientVisitComponent} from "./view/modules/Reports/patient-visit/patient-visit.component";
import {YearlyPaymentComponent} from "./view/modules/Reports/yearly-payment/yearly-payment.component";

const routes: Routes = [
  {path: "login", component: LoginComponent},
  {path: "", redirectTo: 'login', pathMatch: 'full'},
  {
    path: "main",
    component: MainwindowComponent,
    children: [
      {path: "home", component: HomeComponent},
      {path:"reports", component: ArrearsByProgramComponent},
      {path:"payments",component:PaymentComponent},
      {path: "home/payments", redirectTo: 'payments', pathMatch: 'full'},
      {path: "home/batchregistration", redirectTo: 'batchregistration', pathMatch: 'full'},
      {path: "home/students", redirectTo: 'students', pathMatch: 'full'},
      {path: "home/class", redirectTo: 'class', pathMatch: 'full'},
      {path: "home/books", redirectTo: 'books', pathMatch: 'full'},
      {path: "home/attendance", redirectTo: 'attendance', pathMatch: 'full'},
      {path: "doctor",component:DoctorComponent},
      {path: "patient",component:PatientComponent},
      {path: "room",component:RoomComponent},
      {path: "schedule",component:ScheduleComponent},
      {path: "appointment",component:AppointmentComponent},
      {path: "prescription",component:PrescriptionComponent},
      {path: "privilage",component:PrivilageComponent},
      {path: "staff",component:StaffComponent},
      {path: "user1",component:User1Component},
      {path: "prescriptionhistory",component:PrescriptionHistoryComponent},
      {path: "patientVisits",component:PatientVisitComponent},
      {path: "YearlyPayment",component:YearlyPaymentComponent},

    ]
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
