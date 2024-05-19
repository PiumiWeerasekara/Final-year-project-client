import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Specialization} from "../entity/specialization";

@Injectable({
  providedIn: 'root'
})

export class SpecializationService {

  constructor(private http: HttpClient) {  }

  async getAllList(): Promise<Array<Specialization>> {

    const specialization = await this.http.get<Array<Specialization>>('http://localhost:8080/specialities/list').toPromise();
    if(specialization == undefined){
      return [];
    }
    return specialization;
  }

}


