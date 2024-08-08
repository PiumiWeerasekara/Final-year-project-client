import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Room} from "../../../entity/room";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {RoomService} from "../../../service/room.service";
import {AuthorizationManager} from "../../../service/authorizationmanager";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Specialization} from "../../../entity/specialization";
import {Schedule} from "../../../entity/schedule";
import {ScheduleService} from "../../../service/schedule.service";
import {Doctor} from "../../../entity/doctor";
import {DoctorService} from "../../../service/doctor.service";
import {ChangeDetectorRef} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  public ssearch!: FormGroup;
  public form!: FormGroup;
  public isFormEnable: boolean = false;
  public isCreate: boolean = false;

  schedule!: Schedule;
  oldSchedule!: Schedule;

  selectedrow: any;
  minDate: Date;

  // imageurl: string = 'assets/default.png'
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // enaadd:boolean = false;
  // enaupd:boolean = false;
  // enadel:boolean = false;

  regexes: any;

  uiassist: UiAssist;

  displayedColumns: string[] = ['doctor', 'room', 'date', 'startTime', 'endTime', 'status', 'edit', 'delete'];
  dataSource: MatTableDataSource<Schedule>;

  schedules: Array<Schedule> = [];
  doctors: Array<Doctor> = [];
  rooms: Array<Room> = [];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private rs: RegexService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private ros: RoomService,
    private dr: DoctorService,
    private ss: ScheduleService,
    public authService: AuthorizationManager,
    private cdr: ChangeDetectorRef) {

    this.uiassist = new UiAssist(this);

    this.ssearch = this.fb.group({
      "ssDoctor": new FormControl(),
      "ssScheduleDate": new FormControl(),
      "ssRoom": new FormControl(),
    });


    this.form = this.fb.group({
      "doctor": new FormControl('', [Validators.required]),
      "scheduleDate": new FormControl('', [Validators.required]),
      "startTime": new FormControl('', [Validators.required]),
      "endTime": new FormControl('', [Validators.required]),
      "room": new FormControl('', [Validators.required]),
      "noOfPatient": new FormControl('', [Validators.required]),
    }, {updateOn: 'change'});

    this.dataSource = new MatTableDataSource(this.schedules);
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.dr.getAll('').then((docs: Doctor[]) => {
      this.doctors = docs.filter(doc => doc.status === 1);
    });

    this.ros.getAll('').then((rooms: Room[]) => {
      this.rooms = rooms;
    });
    this.createView();

    this.rs.get('employee').then((regs: []) => {
      this.regexes = regs;
      this.createForm();
    });
    this.loadTable("");
    this.setupValueChangeTracking();
  }

  createView() {
    // this.imageurl = 'assets/pending.gif';
  }

  getAvailableRooms() {
    this.schedule = this.form.getRawValue();
    let day = this.schedule.scheduleDate;
    let stTime = this.schedule.startTime;
    let enTime = this.schedule.endTime;

    let query = "";

    if (day != null) query = query + "&day=" + day;
    if (stTime != null) query = query + "&startTime=" + stTime;
    if (enTime != null) query = query + "&endTime=" + enTime;
    this.ss.getAllAvailableRooms(query).then((rooms: Room[]) => {
      this.rooms = rooms;
    });
  }

  setupValueChangeTracking() {
    this.form.controls['endTime'].valueChanges.subscribe(() => {
      this.form.controls['endTime'].markAsDirty();
      this.form.updateValueAndValidity();
      this.cdr.detectChanges();
    });

    this.form.controls['startTime'].valueChanges.subscribe(() => {
      this.form.controls['startTime'].markAsDirty();
      this.form.updateValueAndValidity();
    });
  }

  // onTimeChange(controlName: string) {
  //   const control = this.form.controls[controlName];
  //   control.markAsDirty();
  //   control.updateValueAndValidity();
  // }
  createForm() {
    this.form.controls['doctor'].setValidators([Validators.required]);
    this.form.controls['scheduleDate'].setValidators([Validators.required]);
    this.form.controls['startTime'].setValidators([Validators.required]);
    this.form.controls['endTime'].setValidators([Validators.required]);
    this.form.controls['room'].setValidators([Validators.required]);
    this.form.controls['noOfPatient'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
          // @ts-ignore

          if (this.oldRoom != undefined && control.valid) {
            // @ts-ignore
            if (value === this.room[controlName]) {
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

    this.ss.getAll(query)
      .then((schedules: Schedule[]) => {
        this.schedules = schedules;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.dataSource = new MatTableDataSource(this.schedules);
        this.dataSource.paginator = this.paginator;
      });

  }

  btnSearchMc(): void {

    const sserchdata = this.ssearch.getRawValue();

    let docId = sserchdata.ssDoctor;
    let scheduleDate = sserchdata.ssScheduleDate;
    let roomId = sserchdata.ssRoom;

    let query = "";


    if (docId != null) query = query + "&doctorId=" + docId;
    if (scheduleDate != null) query = query + "&scheduleDate=" + moment(scheduleDate, 'dddd D MMMM YYYY').format('YYYY-MM-DD');
    if (roomId != null) query = query + "&roomId=" + roomId;

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


  fillForm(schedule: Schedule) {
    this.isFormEnable = true;
    this.isCreate = false;

    // this.enableButtons(false,true,true);

    this.selectedrow = schedule;

    this.schedule = JSON.parse(JSON.stringify(schedule));
    this.oldSchedule = JSON.parse(JSON.stringify(schedule));

    //@ts-ignore
    this.schedule.doctor = this.doctors.find(x => x.id === this.schedule.doctor.id);
    //@ts-ignore
    this.schedule.room = this.rooms.find(x => x.id === this.schedule.room.id);
    this.schedule.startTime = this.convertTo12HourFormat(this.schedule.startTime);
    this.schedule.endTime = this.convertTo12HourFormat(this.schedule.endTime);

    this.form.patchValue(this.schedule);
    this.form.markAsPristine();

  }

  convertTimeToDate(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
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

  delete(schedule: Schedule) {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Cancel Schedule",
        message: "Are you sure to Cancel this Schdule? "
          // "<br> <br>" + schedule.
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";

        this.ss.cancel(schedule.id).then((responce: [] | undefined) => {

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
            data: {heading: "Status - Schedule Cancel ", message: delmessage}
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
        heading: "Confirmation - Room Clear",
        message: "Are you sure to Clear following Details ? <br> <br>"
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        this.form.reset();
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
        data: {heading: "Errors - Schedule Save ", message: "You have the following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) {
          return;
        }
      });
    } else {

      this.schedule = this.form.getRawValue();

      if (this.convertTo24HourFormat(this.schedule.startTime) > this.convertTo24HourFormat(this.schedule.endTime)) {
        const errmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Errors - Schedule Save ", message: "End time must be after the start time. Please ensure the end time is set correctly"}
        });
        return;
      }

      if (!this.isCreate) {
        let updates: string = this.getUpdates();

        // if (updates == "") {
        //   const updmsg = this.dg.open(MessageComponent, {
        //     width: '500px',
        //     data: {heading: "Confirmation - Schedule Update", message: "Nothing Changed"}
        //   });
        //   return;
          // updmsg.afterClosed().subscribe(async result => {
          //   if (!result) {
          //     return;
          //   }
          // });
        // } else {
          this.schedule.id = this.selectedrow.id;
          heading = "Confirmation - Schedule Update";
          confirmationMessage = "Are you sure to Save following Updates?";
        // }
      } else {
        let drData: string = "";

        drData = this.formatDate(this.schedule.scheduleDate) + " From " + this.schedule.startTime + " To " + this.schedule.endTime;
        heading = "Confirmation - Schedule Add";
        confirmationMessage = "Are you sure to Save the following Schedule? <br> <br>" + drData;

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
          this.schedule.startTime = this.convertTo24HourFormat(this.schedule.startTime);
          this.schedule.endTime = this.convertTo24HourFormat(this.schedule.endTime);
          this.schedule.status = 1;
          this.ss.save(this.schedule).then((responce: [] | undefined) => {
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
              this.isCreate = true;
              //this.getRoomNumber();
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Schedule Save", message: message}
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

  formatTimeToHHMMSS(timeString: string): string {
    // Create a new Date object with the time string
    const date = new Date(`1970-01-01T${timeString}`);

    // Extract hours, minutes, and seconds
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Return formatted time string
    return `${hours}:${minutes}:${seconds}`;
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
}
