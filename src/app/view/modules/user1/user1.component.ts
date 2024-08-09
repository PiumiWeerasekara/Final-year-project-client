import {Component, Input, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Staff} from "../../../entity/staff";
import {MatPaginator} from "@angular/material/paginator";
import {Gender} from "../../../entity/gender";
import {StaffType} from "../../../entity/staffType";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {GenderService} from "../../../service/genderservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {StaffService} from "../../../service/staff.service";
import {StaffTypeService} from "../../../service/StaffTypeService";
import {AuthorizationManager} from "../../../service/authorizationmanager";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Employee} from "../../../entity/employee";
import {Userstatus} from "../../../entity/userstatus";
import {Usrtype} from "../../../entity/usrtype";
import {User} from "../../../entity/user";
import {Userrole} from "../../../entity/userrole";
import {Role} from "../../../entity/role";
import {UserService} from "../../../service/userservice";
import {User2} from "../../../entity/user2";
import {User1} from "../../../entity/user1";
import {User1Service} from "../../../service/user1service";
import {Doctor} from "../../../entity/doctor";

@Component({
  selector: 'app-user1',
  templateUrl: './user1.component.html',
  styleUrls: ['./user1.component.css']
})
export class User1Component {
  public form!: FormGroup;
  public ssearch!: FormGroup;

  staffs: Array<Staff> = [];

  users: Array<User1> = [];

  user!:User1;
  olduser!:User1;

  public isFormEnable: boolean = false;
  public isCreate: boolean = false;


  selectedrow: any;

  imageurl: string = 'assets/default.png'
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // enaadd:boolean = false;
  // enaupd:boolean = false;
  // enadel:boolean = false;

  genders: Array<Gender> = [];
  staffTypes: Array<StaffType> = [];

  regexes: any;

  uiassist: UiAssist;

  displayedColumns: string[] = ['memberName', 'type', 'userName', 'createddate', 'description', 'edit'];
  dataSource: MatTableDataSource<User1>;

  @ViewChild(MatSort) sort!: MatSort;constructor(
    private rs: RegexService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private dp: DatePipe,
    private dcs: StaffService,
    private sp: StaffTypeService,
    private  us: User1Service,
    public authService: AuthorizationManager) {

    this.uiassist = new UiAssist(this);

    this.ssearch = this.fb.group({
      "ssName": new FormControl(),
      "ssuserName": new FormControl(),
      "ssType": new FormControl(),
    });


    this.form = this.fb.group({
      "staff": new FormControl('',[Validators.required]),
      "username": new FormControl('',[Validators.required]),
      "password": new FormControl('',[Validators.required]),
      "confirmpassword": new FormControl(),
      "docreated": new FormControl('',[Validators.required]),
      "tocreated": new FormControl(this.dp.transform(Date.now(),"hh:mm:ss"),[Validators.required]),
      "description": new FormControl('',Validators.required),
    });

    this.dataSource = new MatTableDataSource(this.users);

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {

    this.createView();

    this.dcs.getAll('').then((stafs: Staff[]) => {
      this.staffs = stafs;//stafs.filter(st => st.status === 1);
    });

    this.rs.get("users").then((regs:[])=>{
      this.regexes = regs;
      this.createForm();
    });
    this.loadTable("");
  }

  createView() {
    this.imageurl = 'assets/pending.gif';
  }


  createForm() {
    this.form.controls['staff'].setValidators([Validators.required]);
    this.form.controls['username'].setValidators([Validators.required, Validators.pattern(this.regexes['username']['regex'])]);
    this.form.controls['password'].setValidators([Validators.required, Validators.pattern(this.regexes['password']['regex'])]);
    this.form.controls['confirmpassword'].setValidators([Validators.required, Validators.pattern(this.regexes['password']['regex'])]);
    this.form.controls['docreated'].setValidators([Validators.required]);
    this.form.controls['tocreated'].setValidators([Validators.required]);
    this.form.controls['description'].setValidators([Validators.required, Validators.pattern(this.regexes['description']['regex'])]);
    Object.values(this.form.controls).forEach( control => { control.markAsTouched(); } );


    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {

          if (this.olduser != undefined && control.valid) {
            // @ts-ignore
            if (value === this.user[controlName]) {
              control.markAsPristine();
            } else {
              control.markAsDirty();
            }
          } else {
            control.markAsPristine();
          }
        }
      );

    }
    // this.enableButtons(true,false,false);
  }

  // enableButtons(add:boolean, upd:boolean, del:boolean){
  //   this.enaadd=add;
  //   this.enaupd=upd;
  //   this.enadel=del;
  // }

  loadTable(query: string) {

    this.us.getAll(query)
      .then((usr: User1[]) => {
        this.users = usr;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.dataSource = new MatTableDataSource(this.users);
        this.dataSource.paginator = this.paginator;
      });

  }

  btnSearchMc(): void {

    const sserchdata = this.ssearch.getRawValue();

    let name = sserchdata.ssName;
    let username = sserchdata.ssuserName;
    let type = sserchdata.ssType;

    let query = "";

    if (name != null && name.trim() != "") query = query + "&name=" + name;
    if (username != null && username.trim() != "") query = query + "&username=" + username;
    if (type != null) query = query + "&type=" + type;

    if (query != "") query = query.replace(/^./, "?")

    this.loadTable(query);

  }

  btnSearchClearMc(): void {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {heading: "Search Clear", message: "Are you sure to Clear the Search?"}
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        this.ssearch.reset();
        this.loadTable("");
      }
    });

  }

  selectImage(e: any): void {
    if (e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.imageurl = event.target.result;
        this.form.controls['photo'].clearValidators();
      }
    }
  }

  clearImage(): void {
    this.imageurl = 'assets/default.png';
    this.form.controls['photo'].setErrors({'required': true});
  }

  getErrors(): string {

    let errors: string = "";

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.errors) {

        if (this.regexes[controlName] != undefined) {
          errors = errors + "<br>" + this.regexes[controlName]['message'];
        } else {
          errors = errors + "<br>Invalid " + controlName;
        }
      }
    }

    return errors;
  }

  fillForm(stf: Staff) {
    this.isFormEnable = true;
    this.isCreate = false;

    // this.enableButtons(false,true,true);

    this.selectedrow = stf;

    this.user = JSON.parse(JSON.stringify(stf));
    this.olduser = JSON.parse(JSON.stringify(stf));
//@ts-ignore
    this.user.staff = this.staffs.find(g => g.id === this.user.staff.id);

    this.form.patchValue(this.user);
    this.form.markAsPristine();

  }


  getUpdates(): string {

    let updates: string = "";
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.dirty) {
        updates = updates + "<br>" + controlName.charAt(0).toUpperCase() + controlName.slice(1) + " Changed";
      }
    }
    return updates;
  }

  // inactive(staff: Staff) {
  //
  //   const confirm = this.dg.open(ConfirmComponent, {
  //     width: '500px',
  //     data: {
  //       heading: "Confirmation - Staff Member Inactive",
  //       message: "Are you sure to Inactive following Staff Member? <br> <br>" + staff.title + ". " + staff.firstName + " " + staff.lastName
  //     }
  //   });
  //
  //   confirm.afterClosed().subscribe(async result => {
  //     if (result) {
  //       let delstatus: boolean = false;
  //       let delmessage: string = "Server Not Found";
  //
  //       this.dcs.inactive(staff.id).then((responce: [] | undefined) => {
  //
  //         if (responce != undefined) { // @ts-ignore
  //           delstatus = responce['errors'] == "";
  //           if (!delstatus) { // @ts-ignore
  //             delmessage = responce['errors'];
  //           }
  //         } else {
  //           delstatus = false;
  //           delmessage = "Content Not Found"
  //         }
  //       }).finally(() => {
  //         if (delstatus) {
  //           delmessage = "Successfully Inactivated";
  //           // this.form.reset();
  //           // this.clearImage();
  //           // Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
  //           this.loadTable("");
  //         }
  //
  //         const stsmsg = this.dg.open(MessageComponent, {
  //           width: '500px',
  //           data: {heading: "Status - Staff Inactive ", message: delmessage}
  //         });
  //         stsmsg.afterClosed().subscribe(async result => {
  //           if (!result) {
  //             return;
  //           }
  //         });
  //
  //       });
  //     }
  //   });
  // }

  clear(): void {
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - User Detail Clear",
        message: "Are you sure to Clear following Details ? <br> <br>"
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        this.form.reset()
      }
    });
  }

  //added by me


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  create() {
    this.isFormEnable = true;
    this.isCreate = true;
  }

  back() {
    this.isCreate = true;
    this.isFormEnable = false;
    this.form.reset();

  }

  save() {

    let errors = this.getErrors();
    let message: string = "";
    let heading: string = "";
    let confirmationMessage: string = "";

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - User Save ", message: "You have the following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {
      this.user = this.form.getRawValue();
      // this.user.usetype= new Usrtype(1, 'Active');
      // this.user.usestatus= new Userstatus(1, 'Registered');
      //
      // let arr: Array<Userrole> = []; // Initialize the array
      // arr.push(new Userrole(new Role(1, 'Admin')));
      // this.user.userroles= arr;

      // this.user.user = 1;
      if (!this.isCreate) {
        let updates: string = this.getUpdates();

        if (updates == "") {
          const updmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Confirmation - User Update", message: "Nothing Changed"}
          });
          return;
          // updmsg.afterClosed().subscribe(async result => {
          //   if (!result) {
          //     return;
          //   }
          // });
        } else {
          this.user.id = this.selectedrow.id;
          heading = "Confirmation - User Update";
          confirmationMessage = "Are you sure to Save following Updates?";
        }
      } else {
        let drData: string = "";

        drData = this.user.username;
        heading = "Confirmation - User Add";
        confirmationMessage = "Are you sure to Save the following User? <br> <br>" + drData;
      }

      let status: boolean = false;
      let message: string = "Server Not Found";

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: heading,
          message: confirmationMessage
        }
      });

      confirm.afterClosed().subscribe(async result => {
        if (result) {
          // console.log("EmployeeService.add(emp)");

          this.us.save(this.user).then((responce: [] | undefined) => {
            //console.log("Res-" + responce);
            //console.log("Un-" + responce == undefined);
            if (responce != undefined) { // @ts-ignore
              console.log("Add-" + responce['id'] + "-" + responce['url'] + "-" + (responce['errors'] == ""));
              // @ts-ignore
              status = responce['errors'] == "";
              console.log("Add Sta-" + status);
              if (!status) { // @ts-ignore
                message = responce['errors'];
              }
            } else {
              console.log("undefined");
              status = false;
              message = "Content Not Found"
            }
          }).finally(() => {

            if (status) {
              message = "Successfully Saved";
              this.form.reset();
              this.clearImage();
              Object.values(this.form.controls).forEach(control => {
                control.markAsTouched();
              });
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -User Save", message: message}
            });

            stsmsg.afterClosed().subscribe(async result => {
              if (!result) {
                return;
              }
            });
          });
        }
      });
    }
  }
}
