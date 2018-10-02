import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { GlobalDataService } from '../../services/global-data.service';
import { MatDialog, MatTableDataSource, MatPaginator } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertDialogComponent } from '../../components/alert-dialog/alert-dialog.component';
import { PromptDialogComponent } from '../../components/prompt-dialog/prompt-dialog.component';
import { Event } from '../../../models/event';
import { firestore } from 'firebase';
import { Purchase } from '../../../models/purchase';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

declare let Stripe: any;

const stripePublicKey =
  "pk_live_U7J2IacDFZyCvYILl45onao9";
  //"pk_test_sVIc8W1jrazk2t1LxqAdnls3";

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  public loading = true;
  public userId!: string;
  public event!: {
    id: string,
    data: Event,
    purchases: Purchase[]
  };

  public dataSource?: MatTableDataSource<{
    address: string,
    status: string,
    invalidator: string
  }>;
  public displayedColumns = ["address", "status", "invalidator"];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public global: GlobalDataService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private http: HttpClient,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
  }

  ngOnInit() {
    this.auth.authState.subscribe(async (user) => {
      if (user == null) {
        this.router.navigate(["accounts", "login"]);
        return;
      }
      await this.global.initialize();
      await this.initialize();

      this.loading = false;
    });
  }

  public async initialize() {
    this.userId = this.auth.auth.currentUser!.uid;

    let id = this.route.snapshot.paramMap.get('id');
    let event = this.global.events.find(event => id == event.id);

    if (!event) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: (this.translation.error as any)[this.global.lang],
          content: ""
        }
      }).afterClosed().subscribe(() => {
        this.router.navigate([""]);
      });
      return;
    }
    this.event = event;

    let tableData = [];

    for(let purchase of this.event.purchases) {
      tableData.push({
        address: purchase.address,
        status: "check_box_outline_blank",
        invalidator: ""
      });
    }

    this.dataSource = new MatTableDataSource(tableData);
    this.dataSource.paginator = this.paginator;
  }

  public async refresh() {
    this.loading = true;

    await this.global.refresh();
    await this.initialize();

    this.loading = false;
  }

  public async editEventName() {
    this.dialog.open(PromptDialogComponent, {
      data: {
        title: (this.translation.edit as any)[this.global.lang],
        input: {
          value: this.event.data.name,
          placeholder: (this.translation.eventName as any)[this.global.lang]
        }
      }
    }).afterClosed().subscribe(async (result) => {
      if (!result || this.event.data.name == result) {
        return;
      }

      let uid = this.auth.auth.currentUser!.uid;

      await this.firestore.collection("users").doc(uid).collection("events").doc(this.event.id).set({
        name: result
      }, { merge: true });

      await this.refresh();
    });
  }

  public changeCapacity(group: string) {
    this.dialog.open(PromptDialogComponent, {
      data: {
        title: (this.translation.changeCapacity as any)[this.global.lang],
        input: {
          type: "number",
          placeholder: (this.translation.capacity as any)[this.global.lang],
          min: 1
        }
      }
    }).afterClosed().subscribe(async (result) => {
      if (!result) {
        return;
      }

    });
  }

  public startSelling() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: (this.translation.startSelling as any)[this.global.lang],
        content: (this.translation.startSellingBody as any)[this.global.lang]
      }
    }).afterClosed().subscribe(async (result) => {
      if (!result) {
        return;
      }
      let uid = this.auth.auth.currentUser!.uid;
      await this.firestore.collection("users").doc(uid).collection("events").doc(this.event.id).set({
        sellingStarted: true
      }, { merge: true });
    });
  }

  public async endSelling(capacity: number) {
    if (!(window as any).PaymentRequest) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: (this.translation.error as any)[this.global.lang],
          content: ""
        }
      });
      return;
    }
    let supportedInstruments: PaymentMethodData[] = [{
      supportedMethods: ['basic-card'],
      data: {
        supportedNetworks: [
          'visa',
          'mastercard'
        ]
      }
    }];

    let details = {
      displayItems: [
        {
          label: `${(this.translation.fee as any)[this.global.lang]}: 100 * ${capacity}`,
          amount: {
            currency: "JPY",
            value: (capacity * 100).toString()
          }
        },
        {
          label: (this.translation.tax as any)[this.global.lang],
          amount: {
            currency: "JPY",
            value: (capacity * 8).toString()
          }
        }
      ],
      total: {
        label: (this.translation.total as any)[this.global.lang],
        amount: {
          currency: "JPY",
          value: (capacity * 108).toString()
        }
      }
    };

    let request = new PaymentRequest(supportedInstruments, details, { requestShipping: false });

    let result = await request.show();
    if (!result) {
      return;
    }

    Stripe.setPublishableKey(stripePublicKey);
    Stripe.card.createToken({
      number: result.details.cardNumber,
      cvc: result.details.cardSecurityCode,
      exp_month: result.details.expiryMonth,
      exp_year: result.details.expiryYear
    }, async (status: any, response: any) => {
      if (response.error) {
        result.complete("fail");

        return;
      }

      try {
        await this.http.post(
          "https://us-central1-ticket-p2p.cloudfunctions.net/endSelling",
          {
            userId: this.auth.auth.currentUser!.uid,
            eventId: this.event.id,
            token: response.id
          }
        ).toPromise();

        result.complete("success");

        this.dialog.open(AlertDialogComponent, {
          data: {
            title: (this.translation.completed as any)[this.global.lang],
            content: ""
          }
        }).afterClosed().subscribe(async () => {
          await this.refresh();
        });
      } catch {
        this.dialog.open(AlertDialogComponent, {
          data: {
            title: (this.translation.error as any)[this.global.lang],
            content: ""
          }
        });

        result.complete("fail");
      }
    });
  }

  public translation = {
    error: {
      en: "Error",
      ja: "エラー"
    },
    completed: {
      en: "Completed",
      ja: "完了"
    },
    unsupported: {
      en: "Request Payment API is not supported in this browser.",
      ja: "Request Payment APIがこのブラウザではサポートされていません。"
    },
    fee: {
      en: "Fee",
      ja: "手数料"
    },
    tax: {
      en: "Consumption tax",
      ja: "消費税"
    },
    total: {
      en: "Total",
      ja: "合計"
    },
    eventOperations: {
      en: "Event operations",
      ja: "イベントに対する操作"
    },
    startSelling: {
      en: "Start selling",
      ja: "販売を開始する"
    },
    startSellingBody: {
      en: "Enabling the API for selling. Once you start selling, you can't change settings of this event.",
      ja: "販売を開始するためのAPIを有効化します。販売を開始すると、イベントの設定を変更することはできません。"
    },
    endSelling: {
      en: "End selling",
      ja: "販売を終了する"
    },
    endSellingBody: {
      en: "Ending selling and Enabling the scanning the QR-codes of tickets. To do this operation, we charge the fee as you go..",
      ja: "販売を終了し、QRコードのスキャン機能を有効化します。この機能を使うために、使用した分だけ、利用料を支払います。"
    },
    startCamera: {
      en: "Start the camera",
      ja: "カメラを起動"
    },
    startCameraBody: {
      en: "Starting the camera to scan QR-code of tickets.",
      ja: "チケットのQRコードを読み取るためのカメラを起動します。"
    },
    eventDescription: {
      en: "Event description",
      ja: "イベント詳細"
    },
    eventId: {
      en: "Event ID",
      ja: "イベントID"
    },
    eventName: {
      en: "Event name",
      ja: "イベント名"
    },
    edit: {
      en: "Edit",
      ja: "編集"
    },
    changeCapacity: {
      en: "Change capacity",
      ja: "定員変更"
    },
    capacity: {
      en: "Capacity",
      ja: "定員"
    },
    userId: {
      en: "User ID",
      ja: "ユーザーID"
    },
    address: {
      en: "Address",
      ja: "アドレス"
    },
    status: {
      en: "Status",
      ja: "使用状況"
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
