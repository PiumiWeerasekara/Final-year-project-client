import {Patient} from "./patient";
import {User} from "./user";
import {Schedule} from "./schedule";

export class AppointmentSearch {
  public scheduleDate!: string;
  public  startTime!: string;
  public  nextAppointmentNo !: string;
  public  id!: number;
  public  doctorId!: number;
  public  specialityId!: number;


  constructor(scheduleDate: string, startTime: string, nextAppointmentNo: string, id: number, doctorId: number, specialityId: number) {
    this.scheduleDate = scheduleDate;
    this.startTime = startTime;
    this.nextAppointmentNo = nextAppointmentNo;
    this.id = id;
    this.doctorId = doctorId;
    this.specialityId = specialityId;
  }
}




