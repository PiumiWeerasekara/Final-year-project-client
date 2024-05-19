import {Gender} from "./gender";
// import {Designation} from "./designation";
// import {Empstatus} from "./empstatus";
// import {Emptype} from "./emptype";

export class Doctor{

  public id !: number;
  public firstName !: string;
  public LastName !: string;
  public photo !: string;
  public dob !: string;
  public address !: string;
  public nic !: string;
  public contactNo !: string;
  public email !: string;
  public gender !: Gender;
  //
  // public designation !: Designation;
  // public empstatus !: Empstatus;
  // public emptype !: Emptype;


  constructor(id: number, firstName: string, LastName: string, photo: string, dob: string, address: string, nic: string, contactNo: string, email: string, gender: Gender) {
    this.id = id;
    this.firstName = firstName;
    this.LastName = LastName;
    this.photo = photo;
    this.dob = dob;
    this.address = address;
    this.nic = nic;
    this.contactNo = contactNo;
    this.email = email;
    this.gender = gender;
  }
}





