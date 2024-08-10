import {Patient} from "./patient";
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

  constructor(id: number, appointmentDate: string, startTime: string, endTime: string, appointmentNo: number, status: number, schedule: Schedule, patient: Patient) {
    this.id = id;
    this.appointmentDate = appointmentDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.appointmentNo = appointmentNo;
    this.status = status;
    this.schedule = schedule;
    this.patient = patient;
  }
}




