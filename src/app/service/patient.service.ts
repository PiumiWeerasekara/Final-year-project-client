import { Injectable } from '@angular/core';
import {Patient} from "../entity/patient";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient) { }
  async getAll(query:string): Promise<Array<Patient>> {
    const patients = await this.http.get<Array<Patient>>('http://localhost:8080/patient'+query).toPromise();
    if(patients == undefined){
      return [];
    }
    return patients;
  }

  async save(patient: Patient): Promise<[]|undefined>{
    return this.http.post<[]>('http://localhost:8080/patient', patient).toPromise();
  }

}
