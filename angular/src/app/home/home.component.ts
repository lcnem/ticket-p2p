import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalDataService } from '../services/global-data.service';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Event } from '../../../../models/event';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { PromptDialogComponent } from '../components/prompt-dialog/prompt-dialog.component';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';
import { Account, Wallet, SimpleWallet, Password } from 'nem-library';
import { firestore } from 'firebase';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public loading = true;
  public progress = 0;

  public dataSource?: MatTableDataSource<{
    id: string,
    eventName: string,
    sales: number,
    capacity: number
  }>;
  public displayedColumns = ["eventName", "capacity"];

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

      await this.refresh();
    });
  }

  public async logout() {
    await this.auth.auth.signOut();
    this.global.refreshed = false;

    this.dialog.open(AlertDialogComponent, {
      data: {
        title: this.translation.completed[this.global.lang],
        content: ""
      }
    }).afterClosed().subscribe(() => {
      this.router.navigate(["accounts", "login"]);
    });
  }

  public async refresh(force?: boolean) {
    this.progress = 0;
    this.loading = true;

    this.progress = 10;
    await this.global.refreshEvents(force);
    this.progress = 40;
    
    let tableData = this.global.events.map(event => {
      let sales = event.sales.length;

      return {
        id: event.id,
        eventName: event.data.name,
        sales: sales,
        capacity: event.capacity
      }
    })
    this.progress = 80;
    this.dataSource = new MatTableDataSource(tableData);
    this.progress = 90;

    this.loading = false;
    this.progress = 100;
  }

  public async createEvent() {
    let eventName: string = await this.dialog.open(PromptDialogComponent, {
      data: {
        title: this.translation.createEvent[this.global.lang],
        input: {
          placeholder: this.translation.eventName[this.global.lang],
        }
      }
    }).afterClosed().toPromise();

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
      groups: [],
      date: firestore.Timestamp.fromDate(new Date())
    } as Event);

    await this.refresh();
    this.router.navigate(["events", newEvent.id]);
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
    completed: {
      en: "Completed",
      ja: "完了"
    } as any,
    logout: {
      en: "Log out",
      ja: "ログアウト"
    } as any,
    terms: {
      en: "Terms of Service",
      ja: "利用規約"
    } as any,
    privacyPolicy: {
      en: "Privacy Policy",
      ja: "プライバシーポリシー"
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
    capacity: {
      en: "Capacity",
      ja: "定員"
    } as any
  };
}
