import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Prescription} from "../entity/prescription";
import {Doctor} from "../entity/doctor";

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  constructor(private http: HttpClient) {  }
  async getAll(query:string): Promise<Array<Prescription>> {
    const prescritions = await this.http.get<Array<Prescription>>('http://localhost:8080/prescription'+query).toPromise();
    if(prescritions == undefined){
      return [];
    }
    return prescritions;
  }


  // async save(prescription: Prescription): Promise<[]|undefined>{
  //   try {
  //     return this.http.post<[]>('http://localhost:8080/prescription', '').toPromise();;
  //   } catch (error) {
  //     console.error("Error saving prescription:", error);
  //     throw error;
  //   }
  // }

  async save(prescription: Prescription): Promise<[]|undefined>{
    return this.http.post<[]>('http://localhost:8080/prescription', prescription).toPromise();
  }

  async getNumber(): Promise<string> {
    try {
      const number = await this.http.get('http://localhost:8080/prescription/getRefNumber', { responseType: 'text' }).toPromise();
      if (number !== undefined) {
        return number.trim(); // trim() removes any surrounding whitespace
      } else {
        console.error('Reference number is undefined');
        return ''; // Return empty string or handle the error as appropriate
      }
    } catch (error) {
      console.error('Error fetching reference number:', error);
      return ''; // Return empty string or handle the error as appropriate
    }
  }
  async getPrescription(id: number): Promise<Prescription | undefined> {
    try {
      // Use the correct URL and handle errors if the request fails
      const response = await this.http.get<Prescription>('http://localhost:8080/prescription/' + id).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching prescription:', error);
      return undefined;
    }
  }


  // async update(doctor: Doctor): Promise<[]|undefined>{
  //   return this.http.put<[]>('http://localhost:8080/doctor', doctor).toPromise();
  // }
}
