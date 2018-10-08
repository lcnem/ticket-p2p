import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';
import { AccountHttp, Address } from 'nem-library';
import { nodes } from '../../../../models/nodes';
import { Sale } from '../../../../models/sale';
import { GlobalDataService } from '../../../services/global-data.service';

@Component({
  selector: 'app-sales-list',
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.css']
})
export class SalesListComponent implements OnInit {
  public loading = true;
  public dataSource?: MatTableDataSource<{
    customerId: string,
    address: string,
    group: string,
    reservation: string,
    status: string,
    invalidator: string
  }>;
  public displayedColumns = ["customerId", "address", "group", "reservation", "status", "invalidator"];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input() sales!: Sale[];

  constructor(
    public global: GlobalDataService
  ) { }

  ngOnInit() {
    let tableData = [];

    for(let purchase of this.sales) {
      tableData.push({
        customerId: purchase.customerId,
        address: purchase.ticket,
        group: purchase.group,
        reservation: purchase.reservation,
        status: "",
        invalidator: ""
      });
    }

    this.dataSource = new MatTableDataSource(tableData);
    this.dataSource.paginator = this.paginator;
    this.paginator.length = this.dataSource!.data.length;
    this.paginator.pageSize = 10;

    this.onPageChanged({
      length: this.paginator.length,
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    });//awaitなしでよい
  }
  
  public async onPageChanged(pageEvent :PageEvent) {
    this.loading = true;

    let accountHttp = new AccountHttp(nodes);
    const pageSize = 25;

    //テーブル表示範囲をiで回す
    for(let i = pageEvent.pageIndex * pageEvent.pageSize; i < (pageEvent.pageIndex + 1) * pageEvent.pageSize && i < pageEvent.length; i++) {
      let address = this.sales[i].ticket;
      let transactions = await accountHttp.allTransactions(new Address(address), {pageSize: pageSize}).toPromise();

      //トランザクション履歴がなければ
      if(transactions.length == 0) {
        this.dataSource!.data[i].status = this.translation.valid[this.global.lang];
      } else {
        this.dataSource!.data[i].status = this.translation.invalid[this.global.lang];
        //ページサイズにデータが詰まってくるのであれば、空きがでるまで回す
        while(transactions.length == pageSize) {
          let hash = transactions[pageSize - 1].getTransactionInfo().hash.data;
          transactions = await accountHttp.allTransactions(new Address(address), { pageSize: pageSize, hash: hash }).toPromise();
        }
        //一番古いトランザクションがわかる
        let invalidator = transactions[transactions.length - 1].signer!.address.plain();
        if(invalidator == "NDFRSC6OVQUOBP6NEHPDDA7ZTYQAS3VNOD6C3DCW") {
          this.dataSource!.data[i].invalidator = this.translation.thisSystem[this.global.lang];
        } else {
          this.dataSource!.data[i].invalidator = invalidator;
        }
      }
    }
    this.loading = false;
  }

  public translation = {
    customerId: {
      en: "Customer ID",
      ja: "顧客ID"
    } as any,
    address: {
      en: "Address",
      ja: "アドレス"
    } as any,
    group: {
      en: "Group",
      ja: "区分"
    } as any,
    reservation: {
      en: "Reservation information",
      ja: "予約情報"
    } as any,
    status: {
      en: "Status",
      ja: "使用状況"
    } as any,
    valid: {
      en: "Valid",
      ja: "有効"
    } as any,
    invalid: {
      en: "Invalid",
      ja: "無効"
    } as any,
    invalidator: {
      en: "Invalidator address",
      ja: "無効化したアドレス"
    } as any,
    thisSystem: {
      en: "This system",
      ja: "このシステム"
    } as any
  };
}
