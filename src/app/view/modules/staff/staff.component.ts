import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {Gender} from "../../../entity/gender";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {GenderService} from "../../../service/genderservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {AuthorizationManager} from "../../../service/authorizationmanager";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Titles} from "../../../shared/constant/titles";
import {Staff} from "../../../entity/staff";
import {StaffType} from "../../../entity/staffType";
import {StaffTypeService} from "../../../service/StaffTypeService";
import {StaffService} from "../../../service/staff.service";

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent {
  public ssearch!: FormGroup;
  public form!: FormGroup;

  public isFormEnable: boolean = false;
  public isCreate: boolean = false;

  staff!: Staff;
  oldStaff!: Staff;

  selectedrow: any;

  imageurl: string = 'assets/default.png'
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // enaadd:boolean = false;
  // enaupd:boolean = false;
  // enadel:boolean = false;

  genders: Array<Gender> = [];
  staffTypes: Array<StaffType> = [];
  //Title = Title;
  Titles = Titles;

  maxDate: Date;

  regexes: any;

  uiassist: UiAssist;

  displayedColumns: string[] = ['name', 'nic', 'contactNo', 'email', 'type', 'edit', 'active'];
  dataSource: MatTableDataSource<Staff>;
  staffs: Array<Staff> = [];

  @ViewChild(MatSort) sort!: MatSort;constructor(
    private gs: GenderService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private dp: DatePipe,
    private dcs: StaffService,
    private sp: StaffTypeService,
    public authService: AuthorizationManager) {

    this.uiassist = new UiAssist(this);

    this.ssearch = this.fb.group({
      "ssName": new FormControl(),
      "ssNic": new FormControl(),
      "ssType": new FormControl(),
    });


    this.form = this.fb.group({
      "title": new FormControl('', [Validators.required]),
      "firstName": new FormControl('', [Validators.required]),
      "lastName": new FormControl('', [Validators.required]),
      "dob": new FormControl('', [Validators.required]),
      "nic": new FormControl('', [Validators.required]),
      "gender": new FormControl('', [Validators.required]),
      "photo": new FormControl('', [Validators.required]),

      "email": new FormControl('', [Validators.required]),
      "contactNo": new FormControl('', [Validators.required]),
      "address": new FormControl('', [Validators.required]),
      "staffType": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});


    this.dataSource = new MatTableDataSource(this.staffs);

    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
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

    this.gs.getAllList().then((gens: Gender[]) => {
      this.genders = gens;
    });

    this.sp.getAllList().then((specs: StaffType[]) => {
      this.staffTypes = specs.filter(st => st.type !== "Doctor");
    });

    this.rs.get('employee').then((regs: []) => {
      this.regexes = regs;
      this.createForm();
    });
    this.loadTable("");
  }

  createView() {
    this.imageurl = 'assets/pending.gif';
  }


  createForm() {
    this.form.controls['title'].setValidators([Validators.required]);
    this.form.controls['firstName'].setValidators([Validators.required]);
    this.form.controls['lastName'].setValidators([Validators.required]);
    this.form.controls['dob'].setValidators([Validators.required]);
    this.form.controls['gender'].setValidators([Validators.required]);
    this.form.controls['nic'].setValidators([Validators.required, Validators.pattern(this.regexes['nic']['regex'])]);
    this.form.controls['photo'].setValidators([Validators.required]);
    this.form.controls['email'].setValidators([Validators.required, Validators.pattern(this.regexes['email']['regex'])]);
    this.form.controls['contactNo'].setValidators([Validators.required, Validators.pattern(this.regexes['mobile']['regex'])]);
    this.form.controls['address'].setValidators([Validators.required, Validators.pattern(this.regexes['address']['regex'])]);
    this.form.controls['staffType'].setValidators([Validators.required]);


    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          if (controlName == "dob" || controlName == "licenseExpDate")
            value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          if (this.oldStaff != undefined && control.valid) {
            // @ts-ignore
            if (value === this.staff[controlName]) {
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

    this.dcs.getAll(query)
      .then((staffs: Staff[]) => {
        //this.staffs = staffs;
        this.staffs = staffs.filter(st => st.staffType.type !== "Doctor");
        this.imageurl = 'assets/default.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.dataSource = new MatTableDataSource(this.staffs);
        this.dataSource.paginator = this.paginator;
      });

  }

  btnSearchMc(): void {

    const sserchdata = this.ssearch.getRawValue();

    let name = sserchdata.ssName;
    let nic = sserchdata.ssNic;
    let specId = sserchdata.ssType;

    let query = "";

    if (name != null && name.trim() != "") query = query + "&name=" + name;
    if (nic != null && nic.trim() != "") query = query + "&nic=" + nic;
    if (specId != null) query = query + "&specialityId=" + specId;

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

    this.staff = JSON.parse(JSON.stringify(stf));
    this.oldStaff = JSON.parse(JSON.stringify(stf));

    if (this.staff.photo != null) {
      this.imageurl = atob(this.staff.photo);
      this.form.controls['photo'].clearValidators();
    } else {
      this.clearImage();
    }
    this.staff.photo = "";

    //@ts-ignore
    this.staff.gender = this.genders.find(g => g.id === this.staff.gender.id);
    //@ts-ignore
    this.staff.staffType = this.staffTypes.find(s => s.id === this.staff.staffType.id);

    this.form.patchValue(this.staff);
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

  inactive(staff: Staff) {
if (staff.status == 0) return;
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Staff Member Inactive",
        message: "Are you sure to Inactive following Staff Member? <br> <br>" + staff.title + ". " + staff.firstName + " " + staff.lastName
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.dcs.inactive(staff.id).then((responce: [] | undefined) => {

          if (responce != undefined) { // @ts-ignore
            delstatus = responce['errors'] == "";
            if (!delstatus) { // @ts-ignore
              delmessage = responce['errors'];
            }
          } else {
            delstatus = false;
            delmessage = "Content Not Found"
          }
        }).finally(() => {
          if (delstatus) {
            delmessage = "Successfully Inactivated";
            // this.form.reset();
            // this.clearImage();
            // Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
            this.loadTable("");
          }

          const stsmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Staff Inactive ", message: delmessage}
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

  clear(): void {
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Staff Detail Clear",
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
    this.clearImage();

  }

  save() {

    let errors = this.getErrors();
    let message: string = "";
    let heading: string = "";
    let confirmationMessage: string = "";

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Staff Member Save ", message: "You have the following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {
      this.staff = this.form.getRawValue();
      this.staff.status = 1;
      if (!this.isCreate) {
        let updates: string = this.getUpdates();

        if (updates == "") {
          const updmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Confirmation - Staff Member Update", message: "Nothing Changed"}
          });
          return;
          // updmsg.afterClosed().subscribe(async result => {
          //   if (!result) {
          //     return;
          //   }
          // });
        } else {
          this.staff.id = this.selectedrow.id;
          heading = "Confirmation - Staff Member Update";
          confirmationMessage = "Are you sure to Save following Updates?";
        }
      } else {
        let drData: string = "";

        drData = this.staff.title + ". " + this.staff.firstName + " " + this.staff.lastName;
        heading = "Confirmation - Staff Member Add";
        confirmationMessage = "Are you sure to Save the following Staff Member? <br> <br>" + drData;
      }

      this.staff.photo = btoa(this.imageurl);

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

          this.dcs.save(this.staff).then((responce: [] | undefined) => {
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
              data: {heading: "Status -Staff Member Save", message: message}
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


