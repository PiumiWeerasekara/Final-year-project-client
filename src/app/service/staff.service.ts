import { Injectable } from '@angular/core';
import {Staff} from "../entity/staff";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(private http: HttpClient) { }

  async getAll(query:string): Promise<Array<Staff>> {
    const staffList = await this.http.get<Array<Staff>>('http://localhost:8080/staff'+query).toPromise();
    if(staffList == undefined){
      return [];
    }
    return staffList;
  }


  async save(staff: Staff): Promise<[]|undefined>{
    return this.http.post<[]>('http://localhost:8080/staff', staff).toPromise();
  }

  async inactive(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.post('http://localhost:8080/staff/' + id).toPromise();
  }
}
