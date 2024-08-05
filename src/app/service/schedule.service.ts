import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Room} from "../entity/room";
import {Schedule} from "../entity/schedule";

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http: HttpClient) { }

  async getAllAvailableRooms(query:string): Promise<Array<Room>> {
    const rooms = await this.http.get<Array<Room>>('http://localhost:8080/schedule/availableRooms'+query).toPromise();
    if(rooms == undefined){
      return [];
    }
    return rooms;
  }

  async save(schedule: Schedule): Promise<[]|undefined>{
    return this.http.post<[]>('http://localhost:8080/schedule', schedule).toPromise();
  }


  async delete(id: number): Promise<[]|undefined>{
    // @ts-ignore
    return this.http.delete('http://localhost:8080/schedule/' + id).toPromise();
  }

  async getAll(query:string): Promise<Array<Schedule>> {
    const schedules = await this.http.get<Array<Schedule>>('http://localhost:8080/schedule'+query).toPromise();
    if(schedules == undefined){
      return [];
    }
    return schedules;
  }
  async getById(id: number): Promise<Schedule |undefined>{
    // @ts-ignore
    return this.http.get('http://localhost:8080/schedule/byScheduleId?id=' + id).toPromise();
  }
}
