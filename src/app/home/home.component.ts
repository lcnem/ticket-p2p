import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalDataService } from '../services/global-data.service';
import { MatDialog } from '@angular/material';
import { Event } from '../../models/event';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { PromptDialogComponent } from '../components/prompt-dialog/prompt-dialog.component';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public loading = true;
  
  constructor(
    public global: GlobalDataService,
    private router: Router,
    private dialog: MatDialog,
    public auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
    this.auth.authState.subscribe(async (user) => {
      if (user == null) {
        this.router.navigate(["accounts", "login"]);
        return;
      }

      await this.global.initialize();

      this.loading = false;
    });
  }

  public async logout() {
    await this.global.logout();
    this.router.navigate(["/accounts/login"]);
  }

  public async refresh() {
    this.loading = true;

    await this.global.refresh();

    this.loading = false;
  }

  public async createEvent() {
    let dialog = this.dialog.open(PromptDialogComponent, {
      data: {
        title: (this.translation.createEvent as any)[this.global.lang],
        input: {
          placeholder: (this.translation.eventName as any)[this.global.lang],
        }
      }
    });

    dialog.afterClosed().subscribe(async (eventName) => {
      if (!eventName) {
        return;
      }

      let uid = this.auth.auth.currentUser!.uid;

      let newEvent = await this.firestore.collection("users").doc(uid).collection("events").add({
        name: eventName,
        sellingStarted: false,
        sellingEnded: false,
        nonce: Math.random(),
        groups: {},
        date: Date.now()
      });

      await this.refresh();
      this.router.navigate(["events", newEvent.id]);
    });
  }

  public async deleteEvent(event: {id: string, data: Event}) {
    if(event.data.sellingStarted) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: (this.translation.error as any)[this.global.lang],
          content: (this.translation.cantDelete as any)[this.global.lang]
        }
      });
      return;
    }

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: (this.translation.confirmation as any)[this.global.lang],
        content: (this.translation.deleteConfirmation as any)[this.global.lang]
      }
    }).afterClosed().subscribe(async (result) => {
      if (!result) {
        return;
      }

      let uid = this.auth.auth.currentUser!.uid;

      await this.firestore.collection("users").doc(uid).collection("events").doc(event.id).delete();

      await this.refresh();
    });

  }

  public translation = {
    language: {
      en: "Language",
      ja: "言語"
    },
    logout: {
      en: "Log out",
      ja: "ログアウト"
    },
    createEvent: {
      en: "Create your event",
      ja: "イベントを作成"
    },
    eventName: {
      en: "Event name",
      ja: "イベント名"
    },
    empty: {
      en: "There is no event.",
      ja: "イベントはありません。"
    },
    error: {
      en: "Error",
      ja: "エラー"
    },
    cantDelete: {
      en: "You can't delete an event during the selling.",
      ja: "販売中のイベントを削除することはできません。"
    },
    confirmation: {
      en: "Confirmation",
      ja: "確認"
    },
    deleteConfirmation: {
      en: "Are you sure to delete the event?",
      ja: "イベントを削除しますか？"
    }
  };
}
