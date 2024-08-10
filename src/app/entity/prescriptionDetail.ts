import {Drug} from "./drug";
import {Prescription} from "./prescription";

export class PrescriptionDetail {

  public id: number = 0;
  public dosage !: string;
  public instruction !: string;
  public prescription !: Prescription;
  public drug !: Drug;

  constructor(id: number, dosage: string, instruction: string, prescription: Prescription, drug: Drug) {
    this.id = id;
    this.dosage = dosage;
    this.instruction = instruction;
    this.prescription = prescription;
    this.drug = drug;
  }
}




