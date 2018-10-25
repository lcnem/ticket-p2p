import { Component, OnInit } from '@angular/core';
import { GlobalDataService } from '../../services/global-data.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Event } from '../../../../../firebase/functions/src/models/event';
import { Sale } from '../../../../../firebase/functions/src/models/sale';
import { MatDialog } from '@angular/material';
import { AlertDialogComponent } from '../../components/alert-dialog/alert-dialog.component';
import { stripeCharge } from 'src/models/stripe';
import { HttpClient } from '@angular/common/http';
import { Group } from '../../../../../firebase/functions/src/models/group';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  public loading = true;
  public event!: {
    id: string,
    data: Event,
    sales: Sale[]
  };
  public name = "";
  public groups: Group[] = [];

  public forms = {
    name: "",
    groups: [{}] as Group[]
  }

  constructor(
    public global: GlobalDataService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.auth.authState.subscribe(async (user) => {
      if (user == null) {
        this.router.navigate(["accounts", "login"]);
        return;
      }
      await this.refresh();
    });
  }

  public async refresh() {
    await this.global.refreshEvents();

    let id = this.route.snapshot.paramMap.get('id');
    let event = this.global.events.find(event => id == event.id);

    if (!event) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: this.translation.error[this.global.lang],
          content: this.translation.notFound[this.global.lang]
        }
      }).afterClosed().subscribe(() => {
        this.router.navigate([""]);
      });
      return;
    }

    this.event = event;
    this.name = event.data.name;
    this.groups = event.groups;
    this.forms.name = this.name;

    this.loading = false;
  }

  public async changeName() {
    let uid = this.auth.auth.currentUser!.uid;

    await this.firestore.collection("users").doc(uid).collection("events").doc(this.event.id).set({
      name: this.forms.name
    } as Event, { merge: true });

    this.dialog.open(AlertDialogComponent, {
      data: {
        title: this.translation.completed[this.global.lang],
        content: ""
      }
    });
    this.name = this.forms.name;
  }

  public addGroup(index: number) {
    if (index != this.forms.groups.length - 1) {
      return;
    }
    this.forms.groups.push({} as any);
  }

  public deleteGroup(index: number) {
    this.forms.groups.splice(index, 1);
  }

  public async addCapacity() {
    let groups = this.groups.filter(g => g.name);
    if (!groups.length) {
      return;
    }

    let capacity = 0;
    for (let group of groups) {
      capacity += group.capacity;
    }

    if (!(window as any).PaymentRequest) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: this.translation.error[this.global.lang],
          content: this.translation.unsupported[this.global.lang]
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
          label: `${this.translation.fee[this.global.lang]}: 50 * ${capacity}`,
          amount: {
            currency: "JPY",
            value: (capacity * 50).toString()
          }
        },
        {
          label: this.translation.tax[this.global.lang],
          amount: {
            currency: "JPY",
            value: (capacity * 4).toString()
          }
        }
      ],
      total: {
        label: this.translation.total[this.global.lang],
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
            eventId: this.event.id,
            token: response.id,
            test: environment.production ? false : true
          }
        ).toPromise();

        result.complete("success");

        this.dialog.open(AlertDialogComponent, {
          data: {
            title: this.translation.completed[this.global.lang],
            content: ""
          }
        }).afterClosed().subscribe(async () => {
          await this.global.back();
        });
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
    error: {
      en: "Error",
      ja: "エラー"
    } as any,
    notFound: {
      en: "Event not found",
      ja: "このイベントは存在しません"
    } as any,
    editEvent: {
      en: "Edit an event",
      ja: "イベントを編集"
    } as any,
    editEventName: {
      en: "Edit an event name",
      ja: "イベント名を編集"
    } as any,
    eventName: {
      en: "Event name",
      ja: "イベント名"
    } as any,
    addGroup: {
      en: "Add group",
      ja: "枠の追加"
    } as any,
    groupName: {
      en: "Group name",
      ja: "グループ名"
    } as any,
    capacity: {
      en: "Capacity",
      ja: "定員"
    } as any,
    submit: {
      en: "Submit",
      ja: "保存"
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
