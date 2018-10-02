import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';
import { AccountHttp, Address } from 'nem-library';
import { nodes } from '../../../../models/nodes';
import { Purchase } from '../../../../models/purchase';
import { GlobalDataService } from '../../../services/global-data.service';

@Component({
  selector: 'app-purchases-list',
  templateUrl: './purchases-list.component.html',
  styleUrls: ['./purchases-list.component.css']
})
export class PurchasesListComponent implements OnInit {
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

  @Input() purchases!: Purchase[];

  constructor(
    public global: GlobalDataService
  ) { }

  ngOnInit() {
    let tableData = [];

    for(let purchase of this.purchases) {
      tableData.push({
        customerId: purchase.customerId,
        address: purchase.address,
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
      let address = this.purchases[i].address;
      let transactions = await accountHttp.allTransactions(new Address(address), {pageSize: pageSize}).toPromise();

      //トランザクション履歴がなければ
      if(transactions.length == 0) {
        this.dataSource!.data[i].status = (this.translation.valid as any)[this.global.lang];
      } else {
        this.dataSource!.data[i].status = (this.translation.invalid as any)[this.global.lang];
        //ページサイズにデータが詰まってくるのであれば、空きがでるまで回す
        while(transactions.length == pageSize) {
          let hash = transactions[pageSize - 1].getTransactionInfo().hash.data;
          transactions = await accountHttp.allTransactions(new Address(address), { pageSize: pageSize, hash: hash }).toPromise();
        }
        //一番古いトランザクションがわかる
        let invalidator = transactions[transactions.length - 1].signer!.address.plain();
        if(invalidator == "NDFRSC6OVQUOBP6NEHPDDA7ZTYQAS3VNOD6C3DCW") {
          this.dataSource!.data[i].invalidator = (this.translation.thisSystem as any)[this.global.lang];
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
    },
    address: {
      en: "Address",
      ja: "アドレス"
    },
    group: {
      en: "Group",
      ja: "区分"
    },
    reservation: {
      en: "Reservation information",
      ja: "予約情報"
    },
    status: {
      en: "Status",
      ja: "使用状況"
    },
    valid: {
      en: "Valid",
      ja: "有効"
    },
    invalid: {
      en: "Invalid",
      ja: "無効"
    },
    invalidator: {
      en: "Invalidator address",
      ja: "無効化したアドレス"
    },
    thisSystem: {
      en: "This system",
      ja: "このシステム"
    }
  };
}
