import {Gender} from "./gender";
import {StaffType} from "./staffType";

export class Staff {

  public id !: number;
  public title !: string;
  public firstName !: string;
  public lastName !: string;
  public photo !: string;
  public dob !: string;
  public nic !: string;
  public address !: string;
  public contactNo !: string;
  public email !: string;
  public gender !: Gender;
  public staffType !: StaffType;
  public status!: number;


  constructor(id: number, title: string, firstName: string, lastName: string, photo: string, dob: string, nic: string, address: string, contactNo: string, email: string, gender: Gender, staffType: StaffType, status: number) {
    this.id = id;
    this.title = title;
    this.firstName = firstName;
    this.lastName = lastName;
    this.photo = photo;
    this.dob = dob;
    this.nic = nic;
    this.address = address;
    this.contactNo = contactNo;
    this.email = email;
    this.gender = gender;
    this.staffType = staffType;
    this.status = status;
  }
}




