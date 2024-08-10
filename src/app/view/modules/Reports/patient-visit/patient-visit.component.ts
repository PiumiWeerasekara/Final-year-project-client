import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {UiAssist} from "../../../../util/ui/ui.assist";
import {Patient} from "../../../../entity/patient";
import {Prescription} from "../../../../entity/prescription";
import {Observable} from "rxjs";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {Appointment} from "../../../../entity/appointment";
import {PrescriptionDetail} from "../../../../entity/prescriptionDetail";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
import {PrescriptionService} from "../../../../service/prescription.service";
import {PatientService} from "../../../../service/patient.service";
import {AuthorizationManager} from "../../../../service/authorizationmanager";
import {map, startWith} from "rxjs/operators";
import {PatientComponent} from "../../patient/patient.component";
import {AppointmentService} from "../../../../service/appointment.service";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-patient-visit',
  templateUrl: './patient-visit.component.html',
  styleUrls: ['./patient-visit.component.css']
})
export class PatientVisitComponent {
  uiassist: UiAssist;

  selectedrow: any;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;

  patient !: Patient;
  patients: Array<Patient> = [];
  arr: Array<Object> = [];

  filteredPatients!: Observable<any[]>;
  dropdownOpen = false;
  searchControl!: FormControl;

  @ViewChild('searchInput', {static: false}) searchInput!: ElementRef;

  displayedColumns: string[] = ['month', 'count'];
  dataSource: MatTableDataSource<Object>;
  appointments: Array<Appointment> = [];

  displayedDrugColumns: string[] = ['drug', 'dosage', 'instruction'];
  drugDataSource: MatTableDataSource<PrescriptionDetail>;
  selectedDrugs: Array<PrescriptionDetail> = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public ssearch!: FormGroup;

  public currentYear!: any;

  prescription: Prescription = {
    id: 0,
    prescribedDate: '',
    referenceNo: '',
    status: 1,
    description: '',
    prescriptionDetails: [],
    appointment: {} as Appointment
  };

  constructor(
    private fb: FormBuilder,
    private dg: MatDialog,
    private as: AppointmentService,
    private pas: PatientService,
    public authService: AuthorizationManager,
    public dialog: MatDialog,
    public datePipe: DatePipe) {
    this.uiassist = new UiAssist(this);
    this.dataSource = new MatTableDataSource(this.arr);
    this.drugDataSource = new MatTableDataSource(this.selectedDrugs);

    this.ssearch = this.fb.group({
      "patient": new FormControl(''),

    }, {updateOn: 'change'});

    this.searchControl = new FormControl('');
    this.currentYear = this.datePipe.transform(new Date(), 'yyyy');
  }

  ngOnInit() {
    this.getPatients();
    this.initialize();
  }

  initialize() {

    this.filteredPatients = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterPatients(value))
    );

    //this.loadTable("");
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

  getPatients() {
    this.pas.getAll('')
      .then((patients: Patient[]) => {
        this.patients = patients.filter(pat => pat.status === 1);
      });
  }

  loadTable(query: string) {
    this.patient = this.ssearch.get('patient')?.value;

    // @ts-ignore
    this.as.getVisitCountForCurrentYear(this.patient.id)
      .then((arr: Array<any> | undefined) => {
        if (arr != undefined){
          //let obj= {month : this.getMonthName(arr[0][0]), count: arr[0][1]};
          this.arr = arr;
        }

      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.dataSource = new MatTableDataSource(this.arr);
        this.dataSource.paginator = this.paginator;
      });
  }

  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  btnSearchMc(): void {
    this.patient = this.ssearch.get('patient')?.value;
    this.loadTable('');
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  convertTo12HourFormat(time: string): string {
    let [hours, minutes, seconds] = time.split(':').map(Number);
    const modifier = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${hours}:${this.padZero(minutes)} ${modifier}`;
  }

  getMonthName(monthNumber: number): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Since the array is zero-indexed and months are 1-indexed, subtract 1
    return monthNames[monthNumber - 1];
  }

}
