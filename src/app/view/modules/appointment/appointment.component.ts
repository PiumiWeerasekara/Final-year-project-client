import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Doctor} from "../../../entity/doctor";
import {MatPaginator} from "@angular/material/paginator";
import {Specialization} from "../../../entity/specialization";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {RegexService} from "../../../service/regexservice";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {DatePipe} from "@angular/common";
import {DoctorService} from "../../../service/doctor.service";
import {SpecializationService} from "../../../service/SpecializationService";
import {AuthorizationManager} from "../../../service/authorizationmanager";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {AppointmentService} from "../../../service/appointment.service";
import {Appointment} from "../../../entity/appointment";
import {ScheduleService} from "../../../service/schedule.service";
import {Schedule} from "../../../entity/schedule";
import {AppointmentSearch} from "../../../entity/appointmentSearch";
import {Patient} from "../../../entity/patient";
import {User} from "../../../entity/user";
import {PatientService} from "../../../service/patient.service";
import {Observable} from "rxjs";
import {map, startWith} from 'rxjs/operators';
import {PatientComponent} from "../patient/patient.component";
import {UserService} from "../../../service/userservice";
import * as moment from "moment/moment";

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css']
})
export class AppointmentComponent {
  public ssearch!: FormGroup;
  public form!: FormGroup;
  public sSearchSchedule!: FormGroup;
  searchControl!: FormControl;

  public isCreate: boolean = false;
  public formNo: number = 1;

  //appointment!: Appointment;
  appointment: Appointment = {
    // initialize with default values
    id: 0,
    appointmentDate: '',
    startTime: '',
    endTime: '',
    appointmentNo: 0,
    status: 1,
    schedule: {} as Schedule,
    patient: {} as Patient
    // user: {} as User
    // other properties of Appointment
  };
  oldAppointment!: Appointment;

  selectedSchedule!: Schedule;
  user!: User;

  selectedrow: any;

  doctorName!: string;
  speciality!: string;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // enaadd:boolean = false;
  // enaupd:boolean = false;
  // enadel:boolean = false;

  specializations: Array<Specialization> = [];
  doctors: Array<Doctor> = [];
  allSchedules: Array<Schedule> = [];
  patients: Array<Patient> = [];

  isShow: boolean = false;
  //schedules: Array<Schedule> = [];

  regexes: any;

  uiassist: UiAssist;

  displayedColumns: string[] = ['doctor', 'patient', 'nic', 'appointmentNo', 'date', 'time', 'view', 'cancel'];
  dataSource: MatTableDataSource<Appointment>;
  appointments: Array<Appointment> = [];

  displayedSColumns: string[] = ['date', 'time', 'availableNo', 'select'];
  dataSourceSchedule: MatTableDataSource<Object>;
  schedules: Array<Object> = [];

  @ViewChild(MatSort) sort!: MatSort;

  //filteredPatients = [...this.patients];
  searchTerm: string = '';

  filteredPatients!: Observable<any[]>;
  dropdownOpen = false;

  @ViewChild('searchInput', {static: false}) searchInput!: ElementRef;

  constructor(
    private rs: RegexService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private dp: DatePipe,
    private ap: AppointmentService,
    private sp: SpecializationService,
    private ds: DoctorService,
    private ss: ScheduleService,
    private ps: PatientService,
    private us: UserService,
    public authService: AuthorizationManager) {

    this.uiassist = new UiAssist(this);
    //this.appointment = {}; // schedule is optional

    this.ssearch = this.fb.group({
      "ssName": new FormControl(),
      "ssNic": new FormControl(),
      "ssDoctor": new FormControl(),
      "ssScheduleDate": new FormControl(),
      "ssAppointmentNo": new FormControl()
    });

    this.sSearchSchedule = this.fb.group({
      "sDoctor": new FormControl(),
      "sSpeciality": new FormControl(),
      "sScheduleDate": new FormControl()
    });

    this.form = this.fb.group({
      "appointmentNo": new FormControl('', [Validators.required]),
      "appointmentDate": new FormControl('', [Validators.required]),
      "startTime": new FormControl('', [Validators.required]),
      "endTime": new FormControl('', [Validators.required]),
      "patient": new FormControl(null, [Validators.required])
      // "gender": new FormControl('', [Validators.required]),
      // "photo": new FormControl('', [Validators.required]),
      //
      // "email": new FormControl('', [Validators.required]),
      // "contactNo": new FormControl('', [Validators.required]),
      // "address": new FormControl('', [Validators.required]),
      //
      // "medicalLicenseNo": new FormControl('', [Validators.required]),
      // "licenseEXPDate": new FormControl('', [Validators.required]),
      // "speciality": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
    this.dataSource = new MatTableDataSource(this.appointments);
    this.dataSourceSchedule = new MatTableDataSource(this.schedules);

    // this.form = this.fb.group({
    //   gender: [null]
    // });
    this.searchControl = new FormControl('');

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSourceSchedule.paginator = this.paginator;
    this.dataSourceSchedule.sort = this.sort;
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {

    this.createView();


    this.ds.getAll('').then((docs: Doctor[]) => {
      this.doctors = docs;
    });

    this.sp.getAllList().then((specs: Specialization[]) => {
      this.specializations = specs;
    });

    this.rs.get('employee').then((regs: []) => {
      this.regexes = regs;
      //this.createForm();
    });
    this.getPatients();
    // this.searchControl.valueChanges.subscribe(value => {
    //   this.filterPatients();
    // });

    // @ts-ignore
    this.us.get(this.authService.getUsername()).then((user: User) => {
      this.user = user;
    });

    this.filteredPatients = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterPatients(value))
    );

    this.loadTable("");
  }

  createView() {
  }


  createForm() {
    this.form.controls['appointmentNo'].setValidators([Validators.required]);
    this.form.controls['appointmentDate'].setValidators([Validators.required]);
    this.form.controls['startTime'].setValidators([Validators.required]);
    this.form.controls['endTime'].setValidators([Validators.required]);
    // this.form.controls['nic'].setValidators([Validators.required, Validators.pattern(this.regexes['nic']['regex'])]);
    this.form.controls['patient'].setValidators([Validators.required]);
    // this.form.controls['email'].setValidators([Validators.required, Validators.pattern(this.regexes['email']['regex'])]);
    // this.form.controls['contactNo'].setValidators([Validators.required, Validators.pattern(this.regexes['mobile']['regex'])]);
    // this.form.controls['address'].setValidators([Validators.required, Validators.pattern(this.regexes['address']['regex'])]);
    // this.form.controls['medicalLicenseNo'].setValidators([Validators.required]);
    // this.form.controls['licenseEXPDate'].setValidators([Validators.required]);
    // this.form.controls['speciality'].setValidators([Validators.required]);


    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore
          if (controlName == "dob" || controlName == "licenseExpDate")
            value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

          if (this.oldAppointment != undefined && control.valid) {
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

  getPatients() {
    this.ps.getAll('')
      .then((patients: Patient[]) => {
        //this.patients = patients;
        this.patients = patients.filter(pat => pat.status === 1);
      });
  }

  // enableButtons(add:boolean, upd:boolean, del:boolean){
  //   this.enaadd=add;
  //   this.enaupd=upd;
  //   this.enadel=del;
  // }

  loadTable(query: string) {

    this.ap.getAll(query)
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

  loadScheduleTable(query: string) {

    // this.ap.getAlltoMakeAppointment(query)
    //   .then((schedules: Schedule[]) => {
    //     this.schedules = schedules;
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   })
    //   .finally(() => {
    //     this.dataSourceSchedule = new MatTableDataSource(this.schedules);
    //     this.dataSourceSchedule.paginator = this.paginator;
    //   });

    this.ap.getAlltoMakeAppointment(query)
      .then((schedules: any[]) => {
        // Format the schedules
        this.schedules = schedules.map(schedule => ({
          ...schedule,
          formattedDate: this.formatDate(schedule.scheduleDate),
          formattedTime: this.formatTime(schedule.startTime)
        }));
        this.isShow = true;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.dataSourceSchedule = new MatTableDataSource(this.schedules);
        this.dataSourceSchedule.paginator = this.paginator;
      });

  }

  btnSearchMc(): void {

    const sserchdata = this.ssearch.getRawValue();

    let name = sserchdata.ssName;
    let nic = sserchdata.ssNic;
    let docId = sserchdata.ssDoctor;
    let appointmentDate = sserchdata.ssScheduleDate;
    let appointmentNo = sserchdata.ssAppointmentNo;

    let query = "";

    if (name != null && name.trim() != "") query = query + "&name=" + name;
    if (nic != null && nic.trim() != "") query = query + "&nic=" + nic;
    if (docId != null) query = query + "&doctorId=" + docId;
    if (appointmentDate != null) query = query + "&appointmentDate=" + moment(appointmentDate, 'dddd D MMMM YYYY').format('YYYY-MM-DD');
    if (appointmentNo != null && appointmentNo.trim() != "") query = query + "&appointmentNo=" + appointmentNo;

    if (query != "") query = query.replace(/^./, "?")

    this.loadTable(query);

  }

  btnSearchScheduleMc(): void {

    const sserchdata = this.sSearchSchedule.getRawValue();

    let docId = sserchdata.sDoctor;
    let specialityId = sserchdata.sSpeciality;
    let scheduleDate = sserchdata.sScheduleDate;

    let query = "";

    if (docId != null) query = query + "&doctorId=" + docId;
    if (scheduleDate != null) query = query + "&scheduleDate=" + moment(scheduleDate, 'dddd D MMMM YYYY').format('YYYY-MM-DD');
    if (specialityId != null) query = query + "&specialityId=" + specialityId;

    if (query != "") query = query.replace(/^./, "?")

    this.loadScheduleTable(query);
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

  fillForm(appointment: Appointment) {
    this.formNo = 3;
    this.isCreate = false;
    this.isShow= false;

    // this.enableButtons(false,true,true);

    this.selectedrow = appointment;

    this.appointment = JSON.parse(JSON.stringify(appointment));
    //this.oldAppointment = JSON.parse(JSON.stringify(appointment));

    // //@ts-ignore
    // this.doctor.gender = this.genders.find(g => g.id === this.doctor.gender.id);
    // //@ts-ignore
    // this.doctor.speciality = this.specializations.find(s => s.id === this.doctor.speciality.id);

    // this.schedule.startTime = this.convertTo12HourFormat(this.schedule.startTime);
    // this.schedule.endTime = this.convertTo12HourFormat(this.schedule.endTime);

    //this.form.patchValue(this.appointment);
    //this.form.markAsPristine();

    this.doctorName = `${this.capitalize(this.appointment.schedule.doctor.title)} ${this.capitalize(this.appointment.schedule.doctor.firstName)} ${this.capitalize(this.appointment.schedule.doctor.lastName)}`;
    this.speciality = this.appointment.schedule.doctor.speciality.name;

    // this.ap.getLastAppointment(this.selectedSchedule.id).then((appointment: Appointment | null) => {
    this.form.controls['appointmentNo'].setValue(this.appointment.appointmentNo);
    this.form.controls['appointmentDate'].setValue(appointment.appointmentDate);
    this.form.controls['startTime'].setValue(this.formatTime(appointment.startTime));
    this.form.controls['endTime'].setValue(this.formatTime(appointment.endTime));
    this.form.controls['patient'].setValue(appointment.patient);

    const selectedPatient = this.patients.find(patient => patient.id === appointment.patient.id);
    if (selectedPatient) {
      this.form.get('patient')?.setValue(selectedPatient);
    }

    // });
    // @ts-ignore
    // this.form.controls['patient'].setValue(appointment.patient);
    // this.form.get('patient')?.setValue(appointment.patient);
    //this.appointment.patient = this.patients.find(g => g.id === appointment.patient.id);

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

  // cancel(appointment: Appointment) {
  //
  //   const confirm = this.dg.open(ConfirmComponent, {
  //     width: '500px',
  //     data: {
  //       heading: "Confirmation - Cancel Appointment",
  //       message: "Are you sure to Cancel following Appointment? <br> <br>" + appointment.appointmentNo
  //     }
  //   });
  //
  //   // confirm.afterClosed().subscribe(async result => {
  //   //   if (result) {
  //   //     let delstatus: boolean = false;
  //   //     let delmessage: string = "Server Not Found";
  //   //
  //   //     this.dcs.delete(doctor.id).then((responce: [] | undefined) => {
  //   //
  //   //       if (responce != undefined) { // @ts-ignore
  //   //         delstatus = responce['errors'] == "";
  //   //         if (!delstatus) { // @ts-ignore
  //   //           delmessage = responce['errors'];
  //   //         }
  //   //       } else {
  //   //         delstatus = false;
  //   //         delmessage = "Content Not Found"
  //   //       }
  //   //     }).finally(() => {
  //   //       if (delstatus) {
  //   //         delmessage = "Successfully Deleted";
  //   //         // this.form.reset();
  //   //         // this.clearImage();
  //   //         // Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
  //   //         this.loadTable("");
  //   //       }
  //   //
  //   //       const stsmsg = this.dg.open(MessageComponent, {
  //   //         width: '500px',
  //   //         data: {heading: "Status - Doctor Delete ", message: delmessage}
  //   //       });
  //   //       stsmsg.afterClosed().subscribe(async result => {
  //   //         if (!result) {
  //   //           return;
  //   //         }
  //   //       });
  //   //
  //   //     });
  //   //   }
  //   // });
  // }

  clear(): void {
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Appointment Clear",
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

  create(row: AppointmentSearch) {
    this.formNo = 3;
    this.isCreate = true;
    this.findSschedule(row.id, row.nextAppointmentNo);
  }

  book() {
    this.formNo = 2;
    this.isCreate = true;
  }

  back() {

    if (this.formNo == 3) {
      if (this.isCreate)
        this.formNo = 2;
      else
        this.formNo = 1;
      this.form.reset();
    } else
      this.formNo = 1;
    this.isCreate = true;
    this.loadTable("");
    this.loadScheduleTable("");

    this.ssearch.reset();
    this.sSearchSchedule.reset();
  }

  findSschedule(scheduleId: number, nextAppointmentNo: string) {
    this.ss.getById(scheduleId).then((schedule: Schedule | undefined) => {
      if (schedule) {

        // this.appointment=this.form.getRawValue();
        this.selectedSchedule = schedule;
        // this.fillForm(this.appointment);
        this.doctorName = `${this.capitalize(this.selectedSchedule.doctor.title)} ${this.capitalize(this.selectedSchedule.doctor.firstName)} ${this.capitalize(this.selectedSchedule.doctor.lastName)}`;
        this.speciality = this.selectedSchedule.doctor.speciality.name;

        this.ap.getLastAppointment(this.selectedSchedule.id).then((appointment: Appointment | null) => {
          this.form.controls['appointmentNo'].setValue(nextAppointmentNo);
          if (appointment) {
            this.form.controls['appointmentDate'].setValue(appointment.appointmentDate);
            this.form.controls['startTime'].setValue(this.formatTime(appointment.endTime));
            this.form.controls['endTime'].setValue(this.formatTime(this.newEndTime(appointment.endTime)));
          } else {
            this.form.controls['appointmentDate'].setValue(schedule.scheduleDate);
            this.form.controls['startTime'].setValue(this.formatTime(schedule.startTime));
            this.form.controls['endTime'].setValue(this.formatTime(this.newEndTime(schedule.startTime)));
          }
        });


      }


    }).catch((error) => {
      console.error('Error fetching schedule:', error);
      // Handle the error as needed
    });

  }

  save() {

    let errors = this.getErrors();
    let message: string = "";
    let heading: string = "";
    let confirmationMessage: string = "";

    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Appointment Save ", message: "You have the following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {
      this.appointment = this.form.getRawValue();
      this.authService.getUsername()
      if (!this.isCreate) {
        let updates: string = this.getUpdates();

        if (updates == "") {
          const updmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Confirmation - Appointment Update", message: "Nothing Changed"}
          });
          return;
          // updmsg.afterClosed().subscribe(async result => {
          //   if (!result) {
          //     return;
          //   }
          // });
        } else {
          this.appointment.id = this.selectedrow.id;
          heading = "Confirmation - Doctor Update";
          confirmationMessage = "Are you sure to Save following Updates?";
        }
      } else {
        let drData: string = "";

        drData = "Appointment No " + this.appointment.appointmentNo + " From " + this.appointment.startTime + " To " + this.appointment.endTime;
        heading = "Confirmation - Appointment Add";
        confirmationMessage = "Are you sure to Save the following Appointment? <br> <br>" + drData;
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
          this.appointment.startTime = this.convertTo24HourFormat(this.appointment.startTime);
          this.appointment.endTime = this.convertTo24HourFormat(this.appointment.endTime);
          this.appointment.schedule = this.selectedSchedule;
          this.appointment.status = 1;
          //this.appointment.user = this.user;
          // console.log("EmployeeService.add(emp)");

          this.ap.save(this.appointment).then((responce: [] | undefined) => {
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


              //this.loadScheduleTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Appointment Save", message: message}
            });

            stsmsg.afterClosed().subscribe(async result => {
              if (!result) {
                return;
              }else {
                this.formNo = 2
                this.isShow = false;
                this.sSearchSchedule.reset();
              }
            });
          });
        }
      });
    }
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

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString('en-GB', options);
  }

  formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  capitalize(value: string): string {
    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // onOpen() {
  //   this.filteredPatients = [...this.patients];
  // }

  // filterPatients() {
  //   if (this.searchTerm) {
  //     this.filteredPatients = this.patients.filter(patient =>
  //       patient.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) || patient.lastName.toLowerCase().includes(this.searchTerm.toLowerCase())
  //     );
  //   } else {
  //     this.filteredPatients = [...this.patients];
  //   }
  // }

  newEndTime(time: string) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes, seconds);
    endTime.setMinutes(endTime.getMinutes() + 15);

    const updatedHours = String(endTime.getHours()).padStart(2, '0');
    const updatedMinutes = String(endTime.getMinutes()).padStart(2, '0');
    const updatedSeconds = String(endTime.getSeconds()).padStart(2, '0');

    const updatedEndTime = `${updatedHours}:${updatedMinutes}:${updatedSeconds}`;
    return updatedEndTime;
  }

  private filterPatients(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.patients.filter(patient =>
      `${patient.title} ${patient.firstName} ${patient.lastName}`.toLowerCase().includes(filterValue)
    );
  }

  onOpen() {
    this.dropdownOpen = true;
  }

  onClose() {
    this.dropdownOpen = false;
  }

  // Focus the search input when dropdown opens
  focusSearchInput() {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  onSearchInputKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
    } else if (event.key === ' ') {
    }
  }

  registerPatient() {
    const dialogRef = this.dg.open(PatientComponent, {
      width: '1000px',
    });
    dialogRef.afterOpened().subscribe(() => {
      dialogRef.componentInstance.create(true);
    });
    dialogRef.afterClosed().subscribe(() => {
      dialogRef.componentInstance.form.reset();
      this.getPatients();
    });
  }

  convertTo24HourFormat(time: string): string {
    const [timePart, modifier] = time.split(' '); // Split into time and AM/PM
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${this.padZero(hours)}:${this.padZero(minutes)}:00`;
  }

  cancel(appointment: Appointment) {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Cancel Appointment",
        message: "Are you sure to Cancel following Appointment? " +
          "<br> <br> Appointment No" + appointment.appointmentNo
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.ap.cancel(appointment).then((responce: [] | undefined) => {

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
            delmessage = "Successfully Cancelled";
            this.form.reset();
            // this.clearImage();
            // Object.values(this.form.controls).forEach(control => { control.markAsTouched(); });
            this.loadTable("");
            //this.getRoomNumber();
          }

          const stsmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Appointment Cancel ", message: delmessage}
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
