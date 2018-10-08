import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalDataService } from '../services/global-data.service';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Event } from '../../models/event';
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

  public dataSource?: MatTableDataSource<{
    id: string,
    eventName: string,
    status: string,
    sales: number,
    capacity: number
  }>;
  public displayedColumns = ["eventName", "status", "capacity"];

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
      await this.initialize();

      this.loading = false;
    });
  }

  public async logout() {
    await this.global.logout();
    this.router.navigate(["accounts", "login"]);
  }

  public async initialize() {
    let tableData = this.global.events.map(event => {
      let status = event.data.sellingStarted ? this.translation.sellingStarted[this.global.lang] : this.translation.sellingNotStarted[this.global.lang];
      let sales = event.sales.length;
      let capacity = 0;
      if (event.data.groups) {
        for (let group of event.data.groups) {
          capacity += group.capacity;
        }
      }

      return {
        id: event.id,
        eventName: event.data.name,
        status: status,
        sales: sales,
        capacity: capacity
      }
    })
    this.dataSource = new MatTableDataSource(tableData);
  }

  public async refresh() {
    this.loading = true;

    await this.global.refresh();
    await this.initialize();

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
        groups: [],
        date: firestore.Timestamp.fromDate(new Date())
      } as Event);

      await this.refresh();
      this.router.navigate(["events", newEvent.id]);
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
    status: {
      en: "Status",
      ja: "ステータス"
    } as any,
    capacity: {
      en: "Capacity",
      ja: "定員"
    } as any,
    sellingNotStarted: {
      en: "Not on sale",
      ja: "未販売"
    } as any,
    sellingStarted: {
      en: "Now on sale",
      ja: "販売中"
    } as any
  };
}
