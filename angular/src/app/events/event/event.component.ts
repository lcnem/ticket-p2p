import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';

import { AlertDialogComponent } from 'src/app/components/alert-dialog/alert-dialog.component';
import { PromptDialogComponent } from 'src/app/components/prompt-dialog/prompt-dialog.component';
import { back } from 'src/models/back';
import { lang } from 'src/models/lang';

import { Event } from '.src/../../firebase/functions/src/models/event';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { EventsService } from 'src/app/services/events.service';
import { GroupDialogComponent } from './group-dialog/group-dialog.component';
import { stripeCharge } from 'src/models/stripe';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  public loading = true;
  get lang() { return lang; };

  public id!: string;
  public userId!: string;

  public event!: Event;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private auth: AngularFireAuth,
    private user: UserService,
    private events: EventsService,
    private http: HttpClient
  ) {
  }

  ngOnInit() {
    this.user.checkLogin().then(async () => {
      await this.refresh();
    });
  }

  public async refresh() {
    this.loading = true;

    await this.events.readEvents();

    this.id = this.route.snapshot.paramMap.get('id') || "";

    this.event = this.events.events![this.id];
    if (!this.event) {
      await this.dialog.open(AlertDialogComponent, {
        data: {
          title: this.translation.error[this.lang],
          content: this.translation.notFound[this.lang]
        }
      }).afterClosed().toPromise();
      this.router.navigate([""]);
      return;
    }
    this.userId = this.auth.auth.currentUser!.uid;

    this.loading = false;
  }

  public back() {
    back(() => this.router.navigate([""]));
  }

  public async editEventName() {
    let eventName: string = await this.dialog.open(PromptDialogComponent, {
      data: {
        title: this.translation.edit[this.lang],
        input: {
          placeholder: this.translation.eventName[this.lang],
          value: this.event.name,
          pattern: "\\S+"
        }
      }
    }).afterClosed().toPromise();

    if (!eventName) {
      return;
    }
    this.event.name = eventName
    await this.events.updateEvent(this.id, { name: eventName });
  }

  public async addGroups() {
    let groups = await this.dialog.open(GroupDialogComponent).afterClosed().toPromise();
    if (!groups || !groups.length) {
      return;
    }

    let capacity = 0;
    for (let group of groups) {
      capacity += group.capacity;
    }

    if (!(window as any).PaymentRequest) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: this.translation.error[this.lang],
          content: this.translation.unsupported[this.lang]
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
          label: `${this.translation.fee[this.lang]}: 50 * ${capacity}`,
          amount: {
            currency: "JPY",
            value: (capacity * 50).toString()
          }
        },
        {
          label: this.translation.tax[this.lang],
          amount: {
            currency: "JPY",
            value: (capacity * 4).toString()
          }
        }
      ],
      total: {
        label: this.translation.total[this.lang],
        amount: {
          currency: "JPY",
          value: (capacity * 54).toString()
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
          "/api/add-capacity",
          {
            userId: this.auth.auth.currentUser!.uid,
            eventId: this.id,
            token: response.id,
            test: environment.stripe.test
          }
        ).toPromise();

        result.complete("success");

        await this.dialog.open(AlertDialogComponent, {
          data: {
            title: this.translation.completed[this.lang],
            content: ""
          }
        }).afterClosed().toPromise();
      } catch {
        this.dialog.open(AlertDialogComponent, {
          data: {
            title: this.translation.error[this.lang],
            content: ""
          }
        });

        result.complete("fail");
      }
    });
  }

  public async deleteEvent() {
    let result = await this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translation.deleteEvent[this.lang],
        content: ""
      }
    }).afterClosed().toPromise();

    if (!result) {
      return;
    }

    await this.events.deleteEvent(this.id);
    this.router.navigate([""]);
  }

  public translation = {
    error: {
      en: "Error",
      ja: "エラー"
    } as any,
    notFound: {
      en: "Not found",
      ja: "イベントが見つかりませんでした。"
    } as any,
    eventDescription: {
      en: "Event description",
      ja: "イベント詳細"
    } as any,
    eventName: {
      en: "Event name",
      ja: "イベント名"
    } as any,
    capacity: {
      en: "Capacity",
      ja: "定員"
    } as any,
    edit: {
      en: "Edit",
      ja: "編集"
    } as any,
    userId: {
      en: "User ID",
      ja: "ユーザーID"
    } as any,
    eventId: {
      en: "Event ID",
      ja: "イベントID"
    } as any,
    privateKey: {
      en: "Private key",
      ja: "秘密鍵"
    } as any,
    eventOperations: {
      en: "Event operations",
      ja: "イベントに対する操作"
    } as any,
    deleteEvent: {
      en: "Delete event",
      ja: "イベントの削除"
    } as any,
    deleteEventBody: {
      en: "Delete this event.",
      ja: "イベントを削除します。"
    } as any,
    addGroups: {
      en: "Add tickets",
      ja: "チケットを追加"
    } as any,
    addGroupsBody: {
      en: "Add Tickets for this event",
      ja: "イベントのチケット枚数を追加することができます"
    } as any,
    startCamera: {
      en: "Start the camera",
      ja: "カメラを起動"
    } as any,
    startCameraBody: {
      en: "Starting the camera to scan QR-code of tickets.",
      ja: "チケットのQRコードを読み取るためのカメラを起動します。"
    } as any,
    unsupported: {
      en: "Request Payment API is not supported in this browser.",
      ja: "Request Payment APIがこのブラウザではサポートされていません。"
    } as any,
    fee: {
      en: "Fee",
      ja: "手数料"
    } as any,
    tax: {
      en: "Consumption tax",
      ja: "消費税"
    } as any,
    total: {
      en: "Total",
      ja: "合計"
    } as any,
    completed: {
      en: "Completed",
      ja: "完了"
    } as any
  };
}
