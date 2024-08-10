import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Specialization} from "../entity/specialization";
import {Drug} from "../entity/drug";

@Injectable({
  providedIn: 'root'
})

export class DrugService {

  constructor(private http: HttpClient) {
  }

  async getAllList(): Promise<Array<Drug>> {

    const drugs = await this.http.get<Array<Specialization>>('http://localhost:8080/drug/list').toPromise();
    if (drugs == undefined) {
      return [];
    }
    return drugs;
  }

}


