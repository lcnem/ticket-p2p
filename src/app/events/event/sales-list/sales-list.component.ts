import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource, MatPaginator, PageEvent, MatDialog } from '@angular/material';
import { AccountHttp, Address } from 'nem-library';
import { nodes } from '../../../../models/nodes';
import { Sale } from '../../../../models/sale';
import { GlobalDataService } from '../../../services/global-data.service';
import { stripeCharge } from 'src/models/stripe';
import { AlertDialogComponent } from 'src/app/components/alert-dialog/alert-dialog.component';
import { PromptDialogComponent } from 'src/app/components/prompt-dialog/prompt-dialog.component';
import { HttpClient } from '@angular/common/http';

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
  @Input() userId!: string;
  @Input() eventId!: string;

  constructor(
    public global: GlobalDataService,
    private dialog: MatDialog,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.initialize();
  }

  public initialize() {
    let tableData = [];

    for (let purchase of this.sales) {
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

  public async onPageChanged(pageEvent: PageEvent) {
    this.loading = true;

    let accountHttp = new AccountHttp(nodes);
    const pageSize = 25;

    //テーブル表示範囲をiで回す
    for (let i = pageEvent.pageIndex * pageEvent.pageSize; i < (pageEvent.pageIndex + 1) * pageEvent.pageSize && i < pageEvent.length; i++) {
      let address = this.sales[i].ticket;
      let transactions = await accountHttp.allTransactions(new Address(address), { pageSize: pageSize }).toPromise();

      //トランザクション履歴がなければ
      if (transactions.length == 0) {
        this.dataSource!.data[i].status = this.translation.valid[this.global.lang];
      } else {
        this.dataSource!.data[i].status = this.translation.invalid[this.global.lang];
        //ページサイズにデータが詰まってくるのであれば、空きがでるまで回す
        while (transactions.length == pageSize) {
          let hash = transactions[pageSize - 1].getTransactionInfo().hash.data;
          transactions = await accountHttp.allTransactions(new Address(address), { pageSize: pageSize, hash: hash }).toPromise();
        }
        //一番古いトランザクションがわかる
        let invalidator = transactions[transactions.length - 1].signer!.address.plain();
        if (invalidator == "NDFRSC6OVQUOBP6NEHPDDA7ZTYQAS3VNOD6C3DCW") {
          this.dataSource!.data[i].invalidator = this.translation.thisSystem[this.global.lang];
        } else {
          this.dataSource!.data[i].invalidator = invalidator;
        }
      }
    }
    this.loading = false;
  }

  public async sendReward(address: string) {
    if (!(window as any).PaymentRequest) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: this.translation.error[this.global.lang],
          content: this.translation.unsupported[this.global.lang]
        }
      });
      return;
    }

    let amount: number = await this.dialog.open(PromptDialogComponent, {
      data: {
        title: this.translation.sendReward[this.global.lang],
        input: {
          min: 0,
          placeholder: this.translation.amount[this.global.lang],
          type: "number"
        }
      }
    }).afterClosed().toPromise();

    let supportedInstruments: PaymentMethodData[] = [{
      supportedMethods: ['basic-card'],
      data: {
        supportedNetworks: [
          'visa',
          'mastercard'
        ]
      }
    }];

    let fee = Math.floor(amount * 0.05);

    let details = {
      displayItems: [
        {
          label: this.translation.reward[this.global.lang],
          amount: {
            currency: "JPY",
            value: amount.toString()
          }
        },
        {
          label: this.translation.fee[this.global.lang],
          amount: {
            currency: "JPY",
            value: fee.toString()
          }
        }
      ],
      total: {
        label: this.translation.total[this.global.lang],
        amount: {
          currency: "JPY",
          value: (amount + fee).toString()
        }
      }
    };

    let request = new PaymentRequest(supportedInstruments, details, { requestShipping: false });

    let result = await request.show();
    if (!result) {
      return;
    }

    stripeCharge(result, async (status: any, response: any) => {
      if (response.error) {
        result.complete("fail");

        return;
      }

      try {
        await this.http.post(
          "/api/v1/send-reward",
          {
            userId: this.userId,
            eventId: this.eventId,
            amount: amount,
            fee: fee,
            token: response.id,
            address: address
          }
        ).toPromise();

        result.complete("success");

        await this.dialog.open(AlertDialogComponent, {
          data: {
            title: this.translation.completed[this.global.lang],
            content: ""
          }
        }).afterClosed().toPromise();

        this.initialize();
      } catch {
        this.dialog.open(AlertDialogComponent, {
          data: {
            title: this.translation.error[this.global.lang],
            content: ""
          }
        });

        result.complete("fail");
      }
    });
  }

  public translation = {
    customerId: {
      en: "Customer ID",
      ja: "顧客ID"
    } as any,
    noSales: {
      en: "There is no sales history.",
      ja: "購入履歴はありません。"
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
    } as any,
    sendReward: {
      en: "Send a reward for the report",
      ja: "通報に対する報酬を送る"
    } as any,
    amount: {
      en: "Amount",
      ja: "量"
    } as any,
    unsupported: {
      en: "Request Payment API is not supported in this browser.",
      ja: "Request Payment APIがこのブラウザではサポートされていません。"
    } as any,
    error: {
      en: "Error",
      ja: "エラー"
    } as any,
    completed: {
      en: "Completed",
      ja: "完了"
    } as any,
    reward: {
      en: "Reward",
      ja: "報酬"
    } as any,
    fee: {
      en: "Fee",
      ja: "手数料"
    } as any,
    total: {
      en: "Total",
      ja: "合計"
    } as any
  };
}
