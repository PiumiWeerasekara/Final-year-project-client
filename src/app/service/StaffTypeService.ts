import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {StaffType} from "../entity/staffType";

@Injectable({
  providedIn: 'root'
})

export class StaffTypeService {

  constructor(private http: HttpClient) {
  }

  async getAllList(): Promise<Array<StaffType>> {

    const types = await this.http.get<Array<StaffType>>('http://localhost:8080/staffTypes/list').toPromise();
    if (types == undefined) {
      return [];
    }
    return types;
  }

}


