import {Patient} from "./patient";
import {User} from "./user";
import {Schedule} from "./schedule";
import {Appointment} from "./appointment";
import {PrescriptionDetail} from "./prescriptionDetail";

export class Prescription {

  public id !: number;
  public prescribedDate !: string;
  public description !: string;
  public referenceNo !: string;
  public status !: number;
  public appointment !: Appointment;
  public prescriptionDetails!: Array<PrescriptionDetail>;


  constructor(id: number, prescribedDate: string, description: string, referenceNo: string, status: number, appointment: Appointment, prescriptionDetails: Array<PrescriptionDetail>) {
    this.id = id;
    this.prescribedDate = prescribedDate;
    this.description = description;
    this.referenceNo = referenceNo;
    this.status = status;
    this.appointment = appointment;
    this.prescriptionDetails = prescriptionDetails;
  }
}




