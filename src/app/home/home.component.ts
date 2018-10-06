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
import { Account, Wallet, SimpleWallet, Password } from 'nem-library';

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

      let password = new Password(uid);
      let privateKey = SimpleWallet.create(uid, password).open(password).privateKey;

      let newEvent = await this.firestore.collection("users").doc(uid).collection("events").add({
        name: eventName,
        privateKey: privateKey,
        sellingStarted: false,
        sellingEnded: false,
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
          title: this.translation.error[this.global.lang],
          content: this.translation.cantDelete[this.global.lang]
        }
      });
      return;
    }

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translation.confirmation[this.global.lang],
        content: this.translation.deleteConfirmation[this.global.lang]
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
    } as any,
    ticketP2p: {
      en: "Ticket Peer to Peer",
      ja: "ちけっとピアツーピア"
    } as any,
    logout: {
      en: "Log out",
      ja: "ログアウト"
    } as any,
    terms: {
      en: "Terms of Service",
      ja: "利用規約"
    } as any,
    createEvent: {
      en: "Create your event",
      ja: "イベントを作成"
    } as any,
    eventName: {
      en: "Event name",
      ja: "イベント名"
    } as any,
    empty: {
      en: "There is no event.",
      ja: "イベントはありません。"
    } as any,
    error: {
      en: "Error",
      ja: "エラー"
    } as any,
    cantDelete: {
      en: "You can't delete an event during the selling.",
      ja: "販売中のイベントを削除することはできません。"
    } as any,
    confirmation: {
      en: "Confirmation",
      ja: "確認"
    } as any,
    deleteConfirmation: {
      en: "Are you sure to delete the event?",
      ja: "イベントを削除しますか？"
    } as any
  };
}
