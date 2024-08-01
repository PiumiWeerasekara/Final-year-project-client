import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Doctor} from "../entity/doctor";
import {Appointment} from "../entity/appointment";

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
}
