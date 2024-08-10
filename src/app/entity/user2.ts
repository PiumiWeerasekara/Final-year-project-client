import {Employee} from "./employee";
import {Userstatus} from "./userstatus";
import {Userrole} from "./userrole";
import {Usrtype} from "./usrtype";
import {Staff} from "./staff";

export class User2 {

  public id !: number;
  public staff!: Staff;
  public username !: string;
  public password !: string;
  public confirmpassword !: string;
  public userroles!: Array<Userrole>;
  public description !: string;
  public tocreated!: string | null;
  public docreated!: string;
  public usestatus !: Userstatus;
  public usetype !: Usrtype;

  constructor() {
  }
}





