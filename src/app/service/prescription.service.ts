import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Prescription} from "../entity/prescription";

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {

  constructor(private http: HttpClient) {
  }

  async getAll(query: string): Promise<Array<Prescription>> {
    const prescritions = await this.http.get<Array<Prescription>>('http://localhost:8080/prescription' + query).toPromise();
    if (prescritions == undefined) {
      return [];
    }
    return prescritions;
  }

  async save(prescription: Prescription): Promise<[] | undefined> {
    return this.http.post<[]>('http://localhost:8080/prescription', prescription).toPromise();
  }

  async getNumber(): Promise<string> {
    try {
      const number = await this.http.get('http://localhost:8080/prescription/getRefNumber', {responseType: 'text'}).toPromise();
      if (number !== undefined) {
        return number.trim();
      } else {
        console.error('Reference number is undefined');
        return '';
      }
    } catch (error) {
      console.error('Error fetching reference number:', error);
      return '';
    }
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    try {
      const response = await this.http.get<Prescription>('http://localhost:8080/prescription/' + id).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching prescription:', error);
      return undefined;
    }
  }

  async getPrescriptionsForPay(query: string): Promise<Array<Prescription>> {
    const pres = await this.http.get<Array<Prescription>>('http://localhost:8080/prescription/currentPrescriptionsToPay' + query).toPromise();
    if (pres == undefined) {
      return [];
    }
    return pres;
  }

  async prescriptionListByPatient(id: number): Promise<Array<Prescription> | undefined> {
    try {
      const response = await this.http.get<Array<Prescription>>('http://localhost:8080/prescription/prescriptionListByPatient/' + id).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching prescription:', error);
      return undefined;
    }
  }
}
