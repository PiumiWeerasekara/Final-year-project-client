import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Gender} from "../../../entity/gender";
import {UiAssist} from "../../../util/ui/ui.assist";
import {GenderService} from "../../../service/genderservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {AuthorizationManager} from "../../../service/authorizationmanager";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {MatSort} from '@angular/material/sort';
import {Title} from "@angular/platform-browser";
import {Titles} from "../../../shared/constant/titles";
import {Specialization} from "../../../entity/specialization";
import {Patient} from "../../../entity/patient";
import {PatientService} from "../../../service/patient.service";


@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent {
  public ssearch!: FormGroup;
  public form!: FormGroup;

  public isFormEnable: boolean = false;
  public isCreate: boolean = false;

  patient!: Patient;
  oldPatient!: Patient;

  selectedrow: any;

  // imageurl: string = 'assets/default.png'
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // enaadd:boolean = false;
  // enaupd:boolean = false;
  // enadel:boolean = false;

  genders: Array<Gender> = [];
  // specializations: Array<Specialization> = [];
  Title = Title;
  Titles = Titles;

  regexes: any;

  uiassist: UiAssist;

  displayedColumns: string[] = ['name', 'nic', 'contactNo', 'email', 'address', 'edit'];
  dataSource: MatTableDataSource<Patient>;
  patients: Array<Patient> = [];
  maxDate: Date;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private gs: GenderService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private dp: DatePipe,
    private dcs: PatientService,
    public authService: AuthorizationManager) {

    this.uiassist = new UiAssist(this);

    this.ssearch = this.fb.group({
      "ssName": new FormControl(),
      "ssNic": new FormControl()
    });


    this.form = this.fb.group({
      "title": new FormControl('', [Validators.required]),
      "firstName": new FormControl('', [Validators.required]),
      "lastName": new FormControl('', [Validators.required]),
      "dob": new FormControl('', [Validators.required]),
      "age": new FormControl(''),
      "nic": new FormControl(''),
      "gender": new FormControl('', [Validators.required]),

      "email": new FormControl('', [Validators.required]),
      "contactNo": new FormControl('', [Validators.required]),
      "address": new FormControl('', [Validators.required]),

      "guardianName": new FormControl('', [Validators.required]),
      "guardianContactNo": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});


    this.dataSource = new MatTableDataSource(this.patients);
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() - 1);
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

    this.rs.get('patient').then((regs: []) => {
      this.regexes = regs;
      this.createForm();
    });
    this.loadTable("");

    this.form.controls['dob'].valueChanges.subscribe((dob: Date) => {
      if (dob) {
        const age = this.calculateAge(dob);
        this.form.controls['age'].setValue(age);
      } else {
        this.form.controls['age'].setValue('');
      }
    });
  }

  createView() {
    // this.imageurl = 'assets/pending.gif';
  }


  createForm() {
    this.form.controls['title'].setValidators([Validators.required]);
    this.form.controls['firstName'].setValidators([Validators.required]);
    this.form.controls['lastName'].setValidators([Validators.required]);
    this.form.controls['dob'];
    this.form.controls['age'];
    this.form.controls['gender'].setValidators([Validators.required]);
    this.form.controls['nic'].setValidators([Validators.pattern(this.regexes['nic']['regex'])]);
    //this.form.controls['photo'].setValidators([Validators.required]);
    this.form.controls['email'].setValidators([Validators.required, Validators.pattern(this.regexes['email']['regex'])]);
    this.form.controls['contactNo'].setValidators([Validators.required, Validators.pattern(this.regexes['contactNo']['regex'])]);
    this.form.controls['address'].setValidators([Validators.required, Validators.pattern(this.regexes['address']['regex'])]);
    this.form.controls['guardianName'].setValidators([Validators.required]);
    this.form.controls['guardianContactNo'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          if (controlName == "dob" || controlName == "licenseExpDate")
            value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          if (this.oldPatient != undefined && control.valid) {
            // @ts-ignore
            if (value === this.patient[controlName]) {
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
      .then((patients: Patient[]) => {
        this.patients = patients;
        // this.imageurl = 'assets/default.png';
      })
      .catch((error) => {
        console.log(error);
        // this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.dataSource = new MatTableDataSource(this.patients);
        this.dataSource.paginator = this.paginator;
      });

  }

  btnSearchMc(): void {

    const sserchdata = this.ssearch.getRawValue();

    let name = sserchdata.ssName;
    let nic = sserchdata.ssNic;
    let specId = sserchdata.ssSpecification;

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

  // selectImage(e: any): void {
  //   if (e.target.files) {
  //     let reader = new FileReader();
  //     reader.readAsDataURL(e.target.files[0]);
  //     reader.onload = (event: any) => {
  //       // this.imageurl = event.target.result;
  //      // this.form.controls['photo'].clearValidators();
  //     }
  //   }
  // }

  // clearImage(): void {
  //   // this.imageurl = 'assets/default.png';
  //   //this.form.controls['photo'].setErrors({'required': true});
  // }

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

  fillForm(patient: Patient) {
    this.isFormEnable = true;
    this.isCreate = false;

    // this.enableButtons(false,true,true);

    this.selectedrow = patient;

    this.patient = JSON.parse(JSON.stringify(patient));
    this.oldPatient = JSON.parse(JSON.stringify(patient));

    // if (this.patient.photo != null) {
    //   // this.imageurl = atob(this.patient.photo);
    //   // this.form.controls['photo'].clearValidators();
    // } else {
    //   // this.clearImage();
    // }
    // this.patient.photo = "";

    //@ts-ignore
    this.patient.gender = this.genders.find(g => g.id === this.patient.gender.id);
    //@ts-ignore
    this.form.patchValue(this.patient);
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

  // delete(patient: Patient) {
  //
  //   const confirm = this.dg.open(ConfirmComponent, {
  //     width: '500px',
  //     data: {
  //       heading: "Confirmation - Patient Delete",
  //       message: "Are you sure to Delete following Patient? <br> <br>" + patient.title + ". " + patient.firstName + " " + patient.lastName
  //     }
  //   });
  //
  //   confirm.afterClosed().subscribe(async result => {
  //     if (result) {
  //       let delstatus: boolean = false;
  //       let delmessage: string = "Server Not Found";
  //
  //       this.dcs.delete(patient.id).then((responce: [] | undefined) => {
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
  //           delmessage = "Successfully Deleted";
  //           // this.form.reset();
  //           // this.clearImage();
  //           // Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
  //           this.loadTable("");
  //         }
  //
  //         const stsmsg = this.dg.open(MessageComponent, {
  //           width: '500px',
  //           data: {heading: "Status - Patient Delete ", message: delmessage}
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
        heading: "Confirmation - Patient Clear",
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
    //this.clearImage();

  }

  save() {

    let errors = this.getErrors();
    let message: string = "";
    let heading: string = "";
    let confirmationMessage: string = "";

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Patient Save ", message: "You have the following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {
      this.patient = this.form.getRawValue();
      if (!this.isCreate) {
        let updates: string = this.getUpdates();

        if (updates == "") {
          const updmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Confirmation - Patient Update", message: "Nothing Changed"}
          });
          return;
          // updmsg.afterClosed().subscribe(async result => {
          //   if (!result) {
          //     return;
          //   }
          // });
        } else {
          this.patient.id = this.selectedrow.id;
          heading = "Confirmation - Patient Update";
          confirmationMessage = "Are you sure to Save following Updates?";
        }
      } else {
        let drData: string = "";

        drData = this.patient.title + ". " + this.patient.firstName + " " + this.patient.lastName;
        heading = "Confirmation - Patient Add";
        confirmationMessage = "Are you sure to Save the following Patient? <br> <br>" + drData;
      }

      // this.patient.photo = btoa(this.imageurl);

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

          this.dcs.save(this.patient).then((responce: [] | undefined) => {
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
              //this.clearImage();
              Object.values(this.form.controls).forEach(control => {
                control.markAsTouched();
              });
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Patient Save", message: message}
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

  calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

}
