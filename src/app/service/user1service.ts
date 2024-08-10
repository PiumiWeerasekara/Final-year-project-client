import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User1} from "../entity/user1";
import {Staff} from "../entity/staff";

@Injectable({
  providedIn: 'root'
})

export class User1Service {

  constructor(private http: HttpClient) {
  }

  async delete(username: string): Promise<[] | undefined> {
    // @ts-ignore
    return this.http.delete('http://localhost:8080/users1/' + username).toPromise();
  }

  async update(user: User1): Promise<[] | undefined> {
    return this.http.put<[]>('http://localhost:8080/users1', user).toPromise();
  }

  async getAll(query: string): Promise<Array<User1>> {
    const users = await this.http.get<Array<User1>>('http://localhost:8080/users1' + query).toPromise();
    if (users == undefined) {
      return [];
    }
    return users;
  }

  async save(user: User1): Promise<[] | undefined> {
    console.log(user);
    return this.http.post<[]>('http://localhost:8080/users1', user).toPromise();
  }

  async get(name: string): Promise<Staff | undefined> {
    // @ts-ignore
    return this.http.get('http://localhost:8080/users1/byName?name=' + name).toPromise();
  }


}


