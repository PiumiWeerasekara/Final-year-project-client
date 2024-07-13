import {Gender} from "./gender";
import {Specialization} from "./specialization";

export class Doctor{

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
  public speciality !: Specialization;
  public  medicalLicenseNo !: string;
  public  licenseEXPDate !: string;


  constructor(id: number, title: string, firstName: string, lastName: string, photo: string, dob: string, nic: string, address: string, contactNo: string, email: string, gender: Gender, speciality: Specialization, medicalLicenseNo: string, licenseEXPDate: string) {
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
    this.speciality = speciality;
    this.medicalLicenseNo = medicalLicenseNo;
    this.licenseEXPDate = licenseEXPDate;
  }
}




