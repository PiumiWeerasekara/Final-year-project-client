import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Specialization} from "../entity/specialization";

@Injectable({
  providedIn: 'root'
})

export class GenderService {

  constructor(private http: HttpClient) {  }

  async getAllList(): Promise<Array<Specialization>> {

    const genders = await this.http.get<Array<Specialization>>('http://localhost:8080/genders/list').toPromise();
    if(genders == undefined){
      return [];
    }
    return genders;
  }

}


