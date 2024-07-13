import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Doctor} from "../entity/doctor";
import {Employee} from "../entity/employee";

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(private http: HttpClient) {  }
  async getAll(query:string): Promise<Array<Doctor>> {
    const doctors = await this.http.get<Array<Doctor>>('http://localhost:8080/doctor'+query).toPromise();
    if(doctors == undefined){
      return [];
    }
    return doctors;
  }

  async save(doctor: Doctor): Promise<[]|undefined>{
    return this.http.post<[]>('http://localhost:8080/doctor', doctor).toPromise();
  }

  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/doctor/' + id).toPromise();
  }

  // async update(doctor: Doctor): Promise<[]|undefined>{
  //   return this.http.put<[]>('http://localhost:8080/doctor', doctor).toPromise();
  // }
}
