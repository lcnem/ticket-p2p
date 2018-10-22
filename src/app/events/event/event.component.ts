import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { GlobalDataService } from '../../services/global-data.service';
import { MatDialog, MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AlertDialogComponent } from '../../components/alert-dialog/alert-dialog.component';
import { PromptDialogComponent } from '../../components/prompt-dialog/prompt-dialog.component';
import { Event } from '../../../../models/event';
import { Sale } from '../../../../models/sale';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

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
    sales: Sale[]
  };

  constructor(
    public global: GlobalDataService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
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
      await this.refresh();
    });
  }

  public async refresh(force?: boolean) {
    this.loading = true;

    await this.global.refreshEvents(force);

    this.userId = this.auth.auth.currentUser!.uid;

    let id = this.route.snapshot.paramMap.get('id');
    let event = this.global.events.find(event => id == event.id);

    if (!event) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: this.translation.error[this.global.lang],
          content: ""
        }
      }).afterClosed().subscribe(() => {
        this.router.navigate([""]);
      });
      return;
    }
    this.event = event;

    this.loading = false;
  }

  public async deleteEvent() {
    let result = await this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translation.deleteEvent[this.global.lang],
        content: ""
      }
    }).afterClosed().toPromise();

    if(!result) {
      return;
    }

    let uid = this.auth.auth.currentUser!.uid;
    await this.firestore.collection("users").doc(uid).collection("events").doc(this.event.id).delete();
    this.router.navigate([""]);
  }

  public translation = {
    error: {
      en: "Error",
      ja: "エラー"
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
    editEventDetails: {
      en: "Edit event",
      ja: "イベントの編集"
    } as any,
    editEventDetailsBody: {
      en: "Edit your event details. Once you start selling, you can't change settings of this event.",
      ja: "イベントの設定を編集します。販売開始後は、イベントの設定を変更することはできません。"
    } as any,
    deleteEvent: {
      en: "Delete event",
      ja: "イベントの削除"
    } as any,
    deleteEventBody: {
      en: "Delete this event.",
      ja: "イベントを削除します。"
    } as any,
    startCamera: {
      en: "Start the camera",
      ja: "カメラを起動"
    } as any,
    startCameraBody: {
      en: "Starting the camera to scan QR-code of tickets.",
      ja: "チケットのQRコードを読み取るためのカメラを起動します。"
    } as any,
    eventPurchases: {
      en: "Event Purchases",
      ja: "購入者"
    }
  };
}
