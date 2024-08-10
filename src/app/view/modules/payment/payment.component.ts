import {Component, ViewChild} from '@angular/core';
import {UiAssist} from "../../../util/ui/ui.assist";
import {Prescription} from "../../../entity/prescription";
import {MatTableDataSource} from "@angular/material/table";
import {Appointment} from "../../../entity/appointment";
import {PrescriptionDetail} from "../../../entity/prescriptionDetail";
import {Drug} from "../../../entity/drug";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Doctor} from "../../../entity/doctor";
import {MatPaginator} from "@angular/material/paginator";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {AppointmentService} from "../../../service/appointment.service";
import {DrugService} from "../../../service/DrugService";
import {DoctorService} from "../../../service/doctor.service";
import {ScheduleService} from "../../../service/schedule.service";
import {PrescriptionService} from "../../../service/prescription.service";
import {UserService} from "../../../service/userservice";
import {ActiveUserRoleService} from "../../../service/activeUserRoleServie";
import {AuthorizationManager} from "../../../service/authorizationmanager";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Payment} from "../../../entity/payment";
import {PaymentService} from "../../../service/payment.service";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  uiassist: UiAssist;

  selectedrow: any;

  displayedColumns: string[] = ['patient', 'appointmentNo', 'doctor', 'prescribedDate', 'referenceNo', 'select'];
  dataSource: MatTableDataSource<Prescription>;
  prescriptions: Array<Prescription> = [];

  displayedDrugColumns: string[] = ['drug', 'dosage', 'instruction'];
  drugDataSource: MatTableDataSource<PrescriptionDetail>;
  selectedDrugs: Array<PrescriptionDetail> = [];

  drugs: Array<Drug> = [];

  searchControl!: FormControl;
  public form!: FormGroup;

  public desForm!: FormGroup;

  public change: number = 0.00;


  public isCreate: boolean = false;
  public isFormEnable: boolean = false;
  doctors!: Array<Doctor>;

  public ssearch!: FormGroup;
  regexes: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  prescription: Prescription = {
    id: 0,
    prescribedDate: '',
    referenceNo: '',
    status: 1,
    description: '',
    prescriptionDetails: [],
    appointment: {} as Appointment
  };

  payment: Payment = {
    id: 0,
    billDate: '',
    billTime: '',
    amount: 0,
    prescription: this.prescription,
  };

  constructor(
    private rs: RegexService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private ps: PrescriptionService,
    public aur: ActiveUserRoleService,
    private pas: PaymentService,
    public authService: AuthorizationManager) {
    this.uiassist = new UiAssist(this);
    this.dataSource = new MatTableDataSource(this.prescriptions);
    this.drugDataSource = new MatTableDataSource(this.selectedDrugs);
    this.ssearch = this.fb.group({
      "ssName": new FormControl(),
      "ssRef": new FormControl(),
      "ssAppointmentNo": new FormControl()
    });

    this.desForm = this.fb.group({
      "received": new FormControl('', [Validators.required])
    }, {updateOn: 'change'});

    this.searchControl = new FormControl('');
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.rs.get('employee').then((regs: []) => {
      this.regexes = regs;
    });

    this.loadTable("");
  }

  createForm() {

    this.desForm.controls['description'].setValidators([Validators.required]);


    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
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
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadTable(query: string) {
    this.ps.getPrescriptionsForPay(query)
      .then((pres: Prescription[]) => {
        this.prescriptions = pres;
        //this.prescriptions = pres.filter(pres => pres.status === 1);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.dataSource = new MatTableDataSource(this.prescriptions);
        this.dataSource.paginator = this.paginator;
      });
  }

  create(row: Prescription) {
    this.isFormEnable = true;
    this.isCreate = true;
    this.loadPrescriptionDetails(row);
  }

  loadPrescriptionDetails(pres: Prescription) {
    this.prescription = pres;
    this.selectedDrugs = pres.prescriptionDetails;
    this.drugDataSource = new MatTableDataSource(this.selectedDrugs);
    this.drugDataSource.paginator = this.paginator;
  }

  btnSearchMc(): void {

    const sserchdata = this.ssearch.getRawValue();

    let name = sserchdata.ssName;
    let ref = sserchdata.ssRef;
    let appointmentNo = sserchdata.ssAppointmentNo;

    let query = "";

    if (name != null && name.trim() != "") query = query + "&name=" + name;
    if (ref != null && ref.trim() != "") query = query + "&ref=" + ref;
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

    this.desForm.reset();
    this.selectedDrugs = [];
    this.drugDataSource = new MatTableDataSource(this.selectedDrugs);
    this.drugDataSource.paginator = this.paginator;
  }


  save() {

    let total = this.prescription.appointment.schedule.doctor.fee + this.aur.getCharges();

    if (this.desForm.get('received')?.value < total) {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Payment Save ", message: "Please pay full amount!"}
      });
      return;
    } else {
      this.change = total - this.desForm.get('received')?.value
    }
    let errors = this.getErrors(this.desForm);
    let message: string = "";
    let heading: string = "";
    let confirmationMessage: string = "";

    if (this.selectedDrugs.length <= 0) {
      errors = errors + "<br> Invalid Drug list";
    }
    this.payment.prescription = this.prescription;
    this.payment.billDate = this.prescription.prescribedDate;
    this.payment.amount = total;

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Payment Save ", message: "You have the following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {
      let drData: string = "";

      drData = "Prescription Reference  RX" + this.prescription.referenceNo;
      heading = "Confirmation - Payment Save";
      confirmationMessage = "Are you sure to Save the following Payment? <br> <br>" + drData;


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
          this.pas.save(this.payment).then((responce: [] | undefined) => {
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
              this.desForm.reset();
              this.loadTable("");
              this.desForm.reset();
              this.isFormEnable = false;

            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Payment Save", message: message}
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
}
