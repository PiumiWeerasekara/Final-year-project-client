import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Doctor} from "../../../entity/doctor";
import {MatPaginator} from "@angular/material/paginator";
import {Gender} from "../../../entity/gender";
import {Specialization} from "../../../entity/specialization";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {GenderService} from "../../../service/genderservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {DoctorService} from "../../../service/doctor.service";
import {SpecializationService} from "../../../service/SpecializationService";
import {AuthorizationManager} from "../../../service/authorizationmanager";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent {
  public ssearch!: FormGroup;
  public form!: FormGroup;

  public isFormEnable: boolean = false;
  public isCreate: boolean = false;

  doctor!: Doctor;
  oldDoctor!: Doctor;

  selectedrow: any;

  imageurl: string = 'assets/default.png'
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // enaadd:boolean = false;
  // enaupd:boolean = false;
  // enadel:boolean = false;

  genders: Array<Gender> = [];
  specializations: Array<Specialization> = [];

  regexes: any;

  uiassist: UiAssist;

  displayedColumns: string[] = ['doctor', 'patient', 'nic', 'appointmentNo', 'date', 'time', 'view', 'cancel'];
  dataSource: MatTableDataSource<Doctor>;
  doctors: Array<Doctor> = [];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private gs: GenderService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private dp: DatePipe,
    private dcs: DoctorService,
    private sp: SpecializationService,
    public authService: AuthorizationManager) {

    this.uiassist = new UiAssist(this);

    this.ssearch = this.fb.group({
      "ssName": new FormControl(),
      "ssNic": new FormControl(),
      "ssDoctor": new FormControl(),
      "ssScheduleDate": new FormControl(),
      "ssAppointmentNo": new FormControl()
    });


    this.form = this.fb.group({
      "firstName": new FormControl('', [Validators.required]),
      "lastName": new FormControl('', [Validators.required]),
      "dob": new FormControl('', [Validators.required]),
      "nic": new FormControl('', [Validators.required]),
      "gender": new FormControl('', [Validators.required]),
      "photo": new FormControl('', [Validators.required]),

      "email": new FormControl('', [Validators.required]),
      "contactNo": new FormControl('', [Validators.required]),
      "address": new FormControl('', [Validators.required]),

      "medicalLicenseNo": new FormControl('', [Validators.required]),
      "licenseEXPDate": new FormControl('', [Validators.required]),
      "speciality": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});


    this.dataSource = new MatTableDataSource(this.doctors);
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

    this.sp.getAllList().then((specs: Specialization[]) => {
      this.specializations = specs;
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
    this.form.controls['firstName'].setValidators([Validators.required]);
    this.form.controls['lastName'].setValidators([Validators.required]);
    this.form.controls['dob'].setValidators([Validators.required]);
    this.form.controls['gender'].setValidators([Validators.required]);
    this.form.controls['nic'].setValidators([Validators.required, Validators.pattern(this.regexes['nic']['regex'])]);
    this.form.controls['photo'].setValidators([Validators.required]);
    this.form.controls['email'].setValidators([Validators.required, Validators.pattern(this.regexes['email']['regex'])]);
    this.form.controls['contactNo'].setValidators([Validators.required, Validators.pattern(this.regexes['mobile']['regex'])]);
    this.form.controls['address'].setValidators([Validators.required, Validators.pattern(this.regexes['address']['regex'])]);
    this.form.controls['medicalLicenseNo'].setValidators([Validators.required]);
    this.form.controls['licenseEXPDate'].setValidators([Validators.required]);
    this.form.controls['speciality'].setValidators([Validators.required]);


    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          if (controlName == "dob" || controlName == "licenseExpDate")
            value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          if (this.oldDoctor != undefined && control.valid) {
            // @ts-ignore
            if (value === this.doctor[controlName]) {
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
      .then((doctors: Doctor[]) => {
        this.doctors = doctors;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.dataSource = new MatTableDataSource(this.doctors);
        this.dataSource.paginator = this.paginator;
      });

  }

  btnSearchMc(): void {

    const sserchdata = this.ssearch.getRawValue();

    let name = sserchdata.ssName;
    let nic = sserchdata.ssNic;
    let docId = sserchdata.ssDoctor;
    let scheduleDate = sserchdata.ssScheduleDate;
    let appointmentNo = sserchdata.ssAppointmentNo;

    let query = "";

    if (name != null && name.trim() != "") query = query + "&name=" + name;
    if (nic != null && nic.trim() != "") query = query + "&nic=" + nic;
    if (docId != null) query = query + "&doctorId=" + docId;
    if (scheduleDate != null) query = query + "&scheduleDate=" + scheduleDate;
    if (appointmentNo != null && appointmentNo.trim() != "") query = query + "&appointmentNo=" + nic;

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

  fillForm(doctor: Doctor) {
    this.isFormEnable = true;
    this.isCreate = false;

    // this.enableButtons(false,true,true);

    this.selectedrow = doctor;

    this.doctor = JSON.parse(JSON.stringify(doctor));
    this.oldDoctor = JSON.parse(JSON.stringify(doctor));

    if (this.doctor.photo != null) {
      this.imageurl = atob(this.doctor.photo);
      this.form.controls['photo'].clearValidators();
    } else {
      this.clearImage();
    }
    this.doctor.photo = "";

    //@ts-ignore
    this.doctor.gender = this.genders.find(g => g.id === this.doctor.gender.id);
    //@ts-ignore
    this.doctor.speciality = this.specializations.find(s => s.id === this.doctor.speciality.id);

    this.form.patchValue(this.doctor);
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

  cancel(doctor: Doctor) {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Doctor Delete",
        message: "Are you sure to Delete following Doctor? <br> <br>" + doctor.title + ". " + doctor.firstName + " " + doctor.lastName
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.dcs.delete(doctor.id).then((responce: [] | undefined) => {

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
            delmessage = "Successfully Deleted";
            // this.form.reset();
            // this.clearImage();
            // Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
            this.loadTable("");
          }

          const stsmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Doctor Delete ", message: delmessage}
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
        heading: "Confirmation - Doctor Clear",
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
        data: {heading: "Errors - Doctor Save ", message: "You have the following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {
      this.doctor = this.form.getRawValue();
      if (!this.isCreate) {
        let updates: string = this.getUpdates();

        if (updates == "") {
          const updmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Confirmation - Doctor Update", message: "Nothing Changed"}
          });
          return;
          // updmsg.afterClosed().subscribe(async result => {
          //   if (!result) {
          //     return;
          //   }
          // });
        } else {
          this.doctor.id = this.selectedrow.id;
          heading = "Confirmation - Doctor Update";
          confirmationMessage = "Are you sure to Save following Updates?";
        }
      } else {
        let drData: string = "";

        drData = this.doctor.title + ". " + this.doctor.firstName + " " + this.doctor.lastName;
        heading = "Confirmation - Doctor Add";
        confirmationMessage = "Are you sure to Save the following Doctor? <br> <br>" + drData;
      }

      this.doctor.photo = btoa(this.imageurl);

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

          this.dcs.save(this.doctor).then((responce: [] | undefined) => {
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
              data: {heading: "Status -Doctor Save", message: message}
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
