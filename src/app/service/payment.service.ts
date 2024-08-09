import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Payment} from "../entity/payment";

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) {  }
  async getAll(query:string): Promise<Array<Payment>> {
    const pays = await this.http.get<Array<Payment>>('http://localhost:8080/payment'+query).toPromise();
    if(pays == undefined){
      return [];
    }
    return pays;
  }


  async save(payment: Payment): Promise<[]|undefined>{
    return this.http.post<[]>('http://localhost:8080/payment', payment).toPromise();
  }

  async getPayement(id: number): Promise<Payment | undefined> {
    try {
      // Use the correct URL and handle errors if the request fails
      const response = await this.http.get<Payment>('http://localhost:8080/payment/' + id).toPromise();
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
