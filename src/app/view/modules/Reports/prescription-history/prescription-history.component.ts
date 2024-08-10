import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {UiAssist} from "../../../../util/ui/ui.assist";
import {Prescription} from "../../../../entity/prescription";
import {MatTableDataSource} from "@angular/material/table";
import {Appointment} from "../../../../entity/appointment";
import {PrescriptionDetail} from "../../../../entity/prescriptionDetail";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
import {PrescriptionService} from "../../../../service/prescription.service";
import {AuthorizationManager} from "../../../../service/authorizationmanager";
import {PatientService} from "../../../../service/patient.service";
import {map, startWith} from "rxjs/operators";
import {Patient} from "../../../../entity/patient";
import {Observable} from "rxjs";
import {PatientComponent} from "../../patient/patient.component";

@Component({
  selector: 'app-prescription-history',
  templateUrl: './prescription-history.component.html',
  styleUrls: ['./prescription-history.component.css']
})
export class PrescriptionHistoryComponent {
  uiassist: UiAssist;

  selectedrow: any;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;

  patient !: Patient;
  patients: Array<Patient> = [];
  prescriptions: Array<Prescription> = [];

  filteredPatients!: Observable<any[]>;
  dropdownOpen = false;
  searchControl!: FormControl;

  @ViewChild('searchInput', {static: false}) searchInput!: ElementRef;

  displayedColumns: string[] = ['prescribedDate', 'referenceNo', 'select'];
  dataSource: MatTableDataSource<Prescription>;
  appointments: Array<Appointment> = [];

  displayedDrugColumns: string[] = ['drug', 'dosage', 'instruction'];
  drugDataSource: MatTableDataSource<PrescriptionDetail>;
  selectedDrugs: Array<PrescriptionDetail> = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public ssearch!: FormGroup;

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
    private ps: PrescriptionService,
    private pas: PatientService,
    public authService: AuthorizationManager,
    public dialog: MatDialog) {
    this.uiassist = new UiAssist(this);
    this.dataSource = new MatTableDataSource(this.prescriptions);
    this.drugDataSource = new MatTableDataSource(this.selectedDrugs);

    this.ssearch = this.fb.group({
      "patient": new FormControl(''),

    }, {updateOn: 'change'});

    this.searchControl = new FormControl('');
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
    this.ps.prescriptionListByPatient(this.patient.id)
      .then((prescriptions: Array<Prescription> | undefined) => {
        if (prescriptions != undefined)
          this.prescriptions = prescriptions;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.dataSource = new MatTableDataSource(this.prescriptions);
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

  view() {
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

  loadAppointmentDetails(appointment: Appointment) {
    this.prescription.appointment = appointment;
    this.prescription.prescribedDate = appointment.appointmentDate;
    this.prescription.status = 1;
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

  openDialog(row: Prescription) {
    this.drugDataSource = new MatTableDataSource(row.prescriptionDetails);
    this.dialog.open(this.dialogTemplate, {
      width: '500px'
    });
  }
}
