import {Room} from "./room";
import {Doctor} from "./doctor";

export class Schedule {

  public id !: number;
  public scheduleDate !: string;
  public startTime !: string;
  public endTime !: string;
  public room !: Room;
  public doctor !: Doctor;
  public noOfpatient !: number;
  public status: number = 1;


  constructor(id: number, scheduleDate: string, startTime: string, endTime: string, room: Room, doctor: Doctor, noOfpatient: number, status: number) {
    this.id = id;
    this.scheduleDate = scheduleDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.room = room;
    this.doctor = doctor;
    this.noOfpatient = noOfpatient;
    this.status = status;
  }
}




