import {Patient} from "./patient";
import {User} from "./user";
import {Schedule} from "./schedule";

export class Appointment {

  public id !: number;
  public appointmentDate !: string;
  public startTime !: string;
  public endTime !: string;
  public appointmentNo !: number;
  public status !: number;
  public schedule !: Schedule;
  public patient !: Patient;
  public user !: User;

  constructor(id: number, appointmentDate: string, startTime: string, endTime: string, appointmentNo: number, status: number, schedule: Schedule, patient: Patient, user: User) {
    this.id = id;
    this.appointmentDate = appointmentDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.appointmentNo = appointmentNo;
    this.status = status;
    this.schedule = schedule;
    this.patient = patient;
    this.user = user;
  }
}




