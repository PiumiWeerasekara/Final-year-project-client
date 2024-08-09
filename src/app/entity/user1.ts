import {Staff} from "./staff";

export class User1{

  public id !: number;
  public staff!:Staff;
  public username !: string;
  public password !: string;
  public confirmpassword !: string;
  public description !: string;
  public tocreated!:string | null;
  public docreated!:string;

constructor() {
}

  // constructor(id:number, employee:Employee, username:string,
  //             password:string, confirmpassword:string,userroles:Array<Userrole>, description:string,
  //             tocreated:string, docreated:string,userstatus:Userstatus
  //           ){
  //
  //
  //   this.id=id;
  //   this.employee=employee;
  //   this.username=username;
  //   this.password=password;
  //   this.confirmpassword=confirmpassword;
  //   this.userroles = userroles;
  //   this.description=description;
  //   this.tocreated=tocreated;
  //   this.docreated=docreated;
  //   this.userstatus=userstatus;
  // }


}





