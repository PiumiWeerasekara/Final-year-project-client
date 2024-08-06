import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Doctor} from "../entity/doctor";
import {Appointment} from "../entity/appointment";
import {Schedule} from "../entity/schedule";
import {AppointmentSearch} from "../entity/appointmentSearch";

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private http: HttpClient) {
  }

  async getAll(query: string): Promise<Array<Appointment>> {
    const appointments = await this.http.get<Array<Appointment>>('http://localhost:8080/appointment' + query).toPromise();
    if (appointments == undefined) {
      return [];
    }
    return appointments;
  }

  async save(appointment: Appointment): Promise<[] | undefined> {
    return this.http.post<[]>('http://localhost:8080/appointment', appointment).toPromise();
  }

  async getAppointmentNo(): Promise<number> {
    try {
      const response = await this.http.get('http://localhost:8080/appointment/number', {responseType: 'text'}).toPromise();
      const appointmentNo = Number(response);

      if (!isNaN(appointmentNo)) {
        return appointmentNo;
      } else {
        console.error('Appointment No is not a number');
        return 0;
      }
    } catch (error) {
      console.error('Error fetching appointment no:', error);
      return 0;
    }
  }

  // async getAlltoMakeAppointment(query:string): Promise<Array<Schedule>> {
  //   const schedules = await this.http.get<Array<Schedule>>('http://localhost:8080/appointment/availableSchedules'+query).toPromise();
  //   if(schedules == undefined){
  //     return [];
  //   }
  //   return schedules;
  // }
  // async getAlltoMakeAppointment(query:string): Promise<Array<Object>> {
  //   const schedules = await this.http.get<Array<Object>>('http://localhost:8080/appointment/availableSchedules'+query).toPromise();
  //   if(schedules == undefined){
  //     return [];
  //   }
  //   return schedules;
  // }

  async getAlltoMakeAppointment(query:string): Promise<Array<AppointmentSearch>> {
    const schedules = await this.http.get<Array<AppointmentSearch>>('http://localhost:8080/appointment/availableSchedules'+query).toPromise();
    if(schedules == undefined){
      return [];
    }
    return schedules;
  }

  async getLastAppointment(id:number): Promise<Appointment | null> {
    const appointment = await this.http.get<Appointment>('http://localhost:8080/appointment/lastAppointment?id='+id).toPromise();
    return appointment || null;
  }

  async cancel(appointment: Appointment): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.post('http://localhost:8080/appointment/cancel', appointment).toPromise();
  }
}
