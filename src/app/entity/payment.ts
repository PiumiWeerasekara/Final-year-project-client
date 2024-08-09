import {Patient} from "./patient";
import {User} from "./user";
import {Schedule} from "./schedule";
import {Prescription} from "./prescription";

export class Payment {

  public id !: number;
  public billDate !: string;
  public billTime !: string;
  public amount !: number;
  public prescription !: Prescription;


  constructor(id: number, billDate: string, billTime: string, amount: number, prescription: Prescription) {
    this.id = id;
    this.billDate = billDate;
    this.billTime = billTime;
    this.amount = amount;
    this.prescription = prescription;
  }
}




