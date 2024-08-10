import {Component, ElementRef, TemplateRef, ViewChild} from '@angular/core';
import {UiAssist} from "../../../../util/ui/ui.assist";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatDialog} from "@angular/material/dialog";
import {AuthorizationManager} from "../../../../service/authorizationmanager";
import {DatePipe} from "@angular/common";
import {PaymentService} from "../../../../service/payment.service";

@Component({
  selector: 'app-yearly-payment',
  templateUrl: './yearly-payment.component.html',
  styleUrls: ['./yearly-payment.component.css']
})
export class YearlyPaymentComponent {
  uiassist: UiAssist;

  selectedrow: any;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;

  arr: Array<Object> = [];

  displayedColumns: string[] = ['month', 'count'];
  dataSource: MatTableDataSource<Object>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public currentYear!: any;

  constructor(
    private pas: PaymentService,
    public authService: AuthorizationManager,
    public dialog: MatDialog,
    public datePipe: DatePipe) {
    this.uiassist = new UiAssist(this);
    this.dataSource = new MatTableDataSource(this.arr);

    this.currentYear = this.datePipe.transform(new Date(), 'yyyy');
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.loadTable("");
  }

  loadTable(query: string) {
    // @ts-ignore
    this.pas.getTotalByMonth()
      .then((arr: Array<any> | undefined) => {
        if (arr != undefined) {
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

  getMonthName(monthNumber: number): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Since the array is zero-indexed and months are 1-indexed, subtract 1
    return monthNames[monthNumber - 1];
  }
}
