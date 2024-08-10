import {Doctor} from "./doctor";
import {Schedule} from "./schedule";

export class DoctorSchedule {

  public id !: number;
  public doctor !: Doctor;
  public schedule !: Schedule;


  constructor(id: number, doctor: Doctor, schedule: Schedule) {
    this.id = id;
    this.doctor = doctor;
    this.schedule = schedule;
  }
}




