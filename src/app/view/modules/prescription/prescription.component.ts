import {Component, ViewChild} from '@angular/core';
import {Doctor} from "../../../entity/doctor";
import {Specialization} from "../../../entity/specialization";
import {User} from "../../../entity/user";
import {map, startWith} from "rxjs/operators";
import {RegexService} from "../../../service/regexservice";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {AppointmentService} from "../../../service/appointment.service";
import {SpecializationService} from "../../../service/SpecializationService";
import {DoctorService} from "../../../service/doctor.service";
import {ScheduleService} from "../../../service/schedule.service";
import {PatientService} from "../../../service/patient.service";
import {UserService} from "../../../service/userservice";
import {AuthorizationManager} from "../../../service/authorizationmanager";
import {MatTableDataSource} from "@angular/material/table";
import {UiAssist} from "../../../util/ui/ui.assist";
import {Appointment} from "../../../entity/appointment";
import {MatPaginator} from "@angular/material/paginator";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {AppointmentSearch} from "../../../entity/appointmentSearch";
import {Prescription} from "../../../entity/prescription";
import {Schedule} from "../../../entity/schedule";
import {Patient} from "../../../entity/patient";
import {PrescriptionService} from "../../../service/prescription.service";
import {Drug} from "../../../entity/drug";
import {Titles} from "../../../shared/constant/titles";
import {DrugService} from "../../../service/DrugService";
import {PrescriptionDetail} from "../../../entity/prescriptionDetail";
import {ActiveUserRoleService} from "../../../service/activeUserRoleServie";

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent {

  uiassist: UiAssist;

  selectedrow: any;

  //prescription!: Prescription;
  oldPrescription!: Prescription;

  displayedColumns: string[] = ['patient', 'nic', 'appointmentNo', 'startTime', 'endTime', 'prescription', 'edit'];
  dataSource: MatTableDataSource<Appointment>;
  appointments: Array<Appointment> = [];

  displayedDrugColumns: string[] = ['drug', 'dosage', 'instruction', 'edit', 'remove'];
  drugDataSource: MatTableDataSource<PrescriptionDetail>;
  selectedDrugs: Array<PrescriptionDetail> = [];

  drugs: Array<Drug> = [];

  searchControl!: FormControl;
  public form!: FormGroup;

  public desForm!: FormGroup;


  public isCreate: boolean = false;
  public isFormEnable: boolean = false;
  doctors!: Array<Doctor>;

  public ssearch!: FormGroup;
  regexes: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  prescription: Prescription = {
    // initialize with default values
    id: 0,
    prescribedDate: '',
    referenceNo: '',
    status: 1,
    description: '',
    prescriptionDetails: [],
    appointment: {} as Appointment
  };

  constructor(
    private rs: RegexService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private dp: DatePipe,
    private ap: AppointmentService,
    private dr: DrugService,
    private ds: DoctorService,
    private ss: ScheduleService,
    private ps: PrescriptionService,
    private us: UserService,
    public aur: ActiveUserRoleService,
    public authService: AuthorizationManager) {
    this.uiassist = new UiAssist(this);
    this.dataSource = new MatTableDataSource(this.appointments);
    this.drugDataSource = new MatTableDataSource(this.selectedDrugs);

    // this.form = this.fb.group({
    //   gender: [null]
    // });
    this.ssearch = this.fb.group({
      "ssName": new FormControl(),
      "ssNic": new FormControl(),
      "ssAppointmentNo": new FormControl()
    });

    this.form = this.fb.group({
      "drug": new FormControl('', [Validators.required]),
      "dosage": new FormControl('', [Validators.required]),
      "instruction": new FormControl('', [Validators.required]),
    }, {updateOn: 'change'});

    this.desForm = this.fb.group({
      "description": new FormControl('', [Validators.required])
    }, {updateOn: 'change'});

    this.searchControl = new FormControl('');
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {

    // this.createView();


    this.dr.getAllList().then((drugs: Drug[]) => {
      this.drugs = drugs;
    });

    // this.sp.getAllList().then((specs: Specialization[]) => {
    //   this.specializations = specs;
    // });

    this.rs.get('employee').then((regs: []) => {
      this.regexes = regs;
      this.createForm();
    });
    // this.getPatients();
    // this.searchControl.valueChanges.subscribe(value => {
    //   this.filterPatients();
    // });

    // @ts-ignore
    // this.us.get(this.authService.getUsername()).then((user: User) => {
    //   this.user = user;
    // });

    // this.filteredPatients = this.searchControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this.filterPatients(value))
    // );

    this.loadTable("");
  }

  getRefNumber() {
    this.ps.getNumber().then((number: String) => {
      this.prescription.referenceNo = number.toString();
    });
  }

  createForm() {
    this.form.controls['drug'].setValidators([Validators.required]);
    this.form.controls['dosage'].setValidators([Validators.required]);
    this.form.controls['instruction'].setValidators([Validators.required]);

    this.desForm.controls['description'].setValidators([Validators.required]);


    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          // if (controlName == "dob" || controlName == "licenseExpDate")
          //   value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          if (this.oldPrescription != undefined && control.valid) {
            // @ts-ignore
            if (value === this.prescription[controlName]) {
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadTable(query: string) {
    query = query + "&username=" + this.authService.getUsername();
    this.ap.getMyCurrentScheduleAppointments(query)
      .then((appointments: Appointment[]) => {
        this.appointments = appointments;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.dataSource = new MatTableDataSource(this.appointments);
        this.dataSource.paginator = this.paginator;
      });
  }

  create(row: Appointment) {
    this.isFormEnable = true;
    this.isCreate = true;
    this.getRefNumber();
    this.loadAppointmentDetails(row);
  }

  loadAppointmentDetails(appointment: Appointment) {
    this.prescription.appointment = appointment;
    this.prescription.prescribedDate = appointment.appointmentDate;
    this.prescription.status = 1;
    // this.prescription = JSON.parse(JSON.stringify(this.prescription));
    // this.form.patchValue(this.prescription);
    this.form.markAsPristine();
    // this.form.controls['appointmentNo'].setValue(this.prescription.appointment.appointmentNo);
    //     this.form.controls['prescribedDate'].setValue(this.prescription.appointment.appointmentDate);


  }

  btnSearchMc(): void {

    const sserchdata = this.ssearch.getRawValue();

    let name = sserchdata.ssName;
    let nic = sserchdata.ssNic;
    let appointmentNo = sserchdata.ssAppointmentNo;

    let query = "";

    if (name != null && name.trim() != "") query = query + "&name=" + name;
    if (nic != null && nic.trim() != "") query = query + "&nic=" + nic;
    if (appointmentNo != null && appointmentNo.trim() != "") query = query + "&appointmentNo=" + appointmentNo;

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

  back() {
    this.isCreate = true;
    this.loadTable("");
    this.ssearch.reset();
    this.isFormEnable = false;
  }

  addRow() {
    let errors = this.getErrors(this.form);
    let message: string = "";
    let heading: string = "";
    let confirmationMessage: string = "";

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '400px',
        data: {heading: "Errors - Add Drug ", message: "You have the following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {
      const drug: PrescriptionDetail = this.form.getRawValue();
      //drug.prescription = this.prescription;
      drug.id = 0;
      const drugIndex = this.selectedDrugs.findIndex(item => item.drug === drug.drug);
      if (drugIndex > -1) {
        this.selectedDrugs[drugIndex] = drug;
      } else {
        this.selectedDrugs.push(drug);
      }

      this.drugDataSource = new MatTableDataSource(this.selectedDrugs);
      this.drugDataSource.paginator = this.paginator;

      this.form.reset();
    }

  }

  editRow(selectedDrug: PrescriptionDetail) {
    this.form.patchValue(selectedDrug);
    this.form.markAsPristine();
  }

  removeRow(selectedDrug: PrescriptionDetail) {
    this.selectedDrugs = this.selectedDrugs.filter(item => item.drug !== selectedDrug.drug);
    this.drugDataSource = new MatTableDataSource(this.selectedDrugs);
    this.drugDataSource.paginator = this.paginator;
  }

  save() {

    let errors = this.getErrors(this.desForm);
    let message: string = "";
    let heading: string = "";
    let confirmationMessage: string = "";

    if (this.selectedDrugs.length <= 0) {
      errors = errors + "<br> Invalid Drug list";
    }
    this.prescription.description = this.form.get('description')?.value;
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Prescription Save ", message: "You have the following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {


      if (!this.isCreate) {
        //let updates: string = this.getUpdates();

        // if (updates == "") {
        //   const updmsg = this.dg.open(MessageComponent, {
        //     width: '500px',
        //     data: {heading: "Confirmation - Appointment Update", message: "Nothing Changed"}
        //   });
        //   return;
        //   // updmsg.afterClosed().subscribe(async result => {
        //   //   if (!result) {
        //   //     return;
        //   //   }
        //   // });
        // } else {
        //this.prescription.id = this.selectedrow.id;
        heading = "Confirmation - Prescription Update";
        confirmationMessage = "Are you sure to Update this Prescription?";
        // }
      } else {
        let drData: string = "";

        drData = "Prescription Reference  RX" + this.prescription.referenceNo;
        heading = "Confirmation - Prescription Add";
        confirmationMessage = "Are you sure to Save the following Prescription? <br> <br>" + drData;
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
          // @ts-ignore
          this.prescription.description = this.desForm.get('description').value;
          this.prescription.prescriptionDetails = this.selectedDrugs;
          //this.appointment.user = this.user;
          // console.log("EmployeeService.add(emp)");

          this.ps.save(this.prescription).then((responce: [] | undefined) => {
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
              Object.values(this.form.controls).forEach(control => {
                control.markAsTouched();
              });

              this.loadTable("");
              this.isFormEnable = false;
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Prescription Save", message: message}
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

  getErrors(form: FormGroup): string {

    let errors: string = "";

    for (const controlName in form.controls) {
      const control = form.controls[controlName];
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

  fillForm(appointment: Appointment) {
    this.isFormEnable = true;
    this.isCreate = false;

    this.loadAppointmentDetails(appointment);

    this.ps.getPrescription(appointment.id).then((prescription: Prescription | undefined) => {
      if (prescription != undefined) {
        this.selectedDrugs = prescription.prescriptionDetails;
        this.prescription = prescription;
        this.desForm.controls['description'].setValue(prescription.description);

        this.drugDataSource = new MatTableDataSource(this.selectedDrugs);
        this.drugDataSource.paginator = this.paginator;
      }

    });


    // // this.enableButtons(false,true,true);
    //
    // this.selectedrow = doctor;
    //
    // this.doctor = JSON.parse(JSON.stringify(doctor));
    // this.oldDoctor = JSON.parse(JSON.stringify(doctor));
    //
    // if (this.doctor.photo != null) {
    //   this.imageurl = atob(this.doctor.photo);
    //   this.form.controls['photo'].clearValidators();
    // } else {
    //   this.clearImage();
    // }
    // this.doctor.photo = "";
    //
    // //@ts-ignore
    // this.doctor.gender = this.genders.find(g => g.id === this.doctor.gender.id);
    // //@ts-ignore
    // this.doctor.speciality = this.specializations.find(s => s.id === this.doctor.speciality.id);
    //
    // this.form.patchValue(this.doctor);
    // this.form.markAsPristine();

  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  convertTo12HourFormat(time: string): string {
    let [hours, minutes, seconds] = time.split(':').map(Number);
    const modifier = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hours should be 12 in 12-hour format

    return `${hours}:${this.padZero(minutes)} ${modifier}`;
  }

  protected readonly Titles = Titles;
}
