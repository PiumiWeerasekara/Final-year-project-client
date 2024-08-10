import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Room} from "../entity/room";

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private http: HttpClient) {
  }

  async getAll(query: string): Promise<Array<Room>> {
    const rooms = await this.http.get<Array<Room>>('http://localhost:8080/room' + query).toPromise();
    if (rooms == undefined) {
      return [];
    }
    return rooms;
  }

  async save(room: Room): Promise<[] | undefined> {
    return this.http.post<[]>('http://localhost:8080/room', room).toPromise();
  }

  async getRoomNumber(): Promise<string> {
    try {
      const roomNumber = await this.http.get('http://localhost:8080/room/number', {responseType: 'text'}).toPromise();
      if (roomNumber !== undefined) {
        return roomNumber.trim();
      } else {
        console.error('Room number is undefined');
        return '';
      }
    } catch (error) {
      console.error('Error fetching room number:', error);
      return '';
    }
  }

  async delete(id: number): Promise<[] | undefined> {
    // @ts-ignore
    return this.http.delete('http://localhost:8080/room/' + id).toPromise();
  }
}
