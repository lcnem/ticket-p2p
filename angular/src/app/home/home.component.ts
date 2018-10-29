import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { AngularFireAuth } from '@angular/fire/auth';
import { Account, Wallet, SimpleWallet, Password, NEMLibrary, NetworkTypes } from 'nem-library';
import * as firebase from 'firebase/app';
import { EventsService } from 'src/app/services/events.service';

import { PromptDialogComponent } from 'src/app/components/prompt-dialog/prompt-dialog.component';
import { lang, setLang } from 'src/models/lang';
import { UserService } from '../services/user.service';

NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public loading = true;
  get lang() { return lang; };
  set lang(value: string) { setLang(value); }

  public photoUrl = "";

  public dataSource = new MatTableDataSource<{
    name: string,
    id: string
  }>();
  public displayedColumns = ["name", "id"];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private auth: AngularFireAuth,
    private user: UserService,
    private events: EventsService
  ) { }

  ngOnInit() {
    this.user.checkLogin().then(async () => {
      await this.refresh();
    });
  }

  public async logout() {
    await this.user.logout();
  }

  public async refresh(force?: boolean) {
    this.loading = true;
    this.dataSource.data = [];

    await this.events.readEvents(force);

    for (let id in this.events.events!) {
      let event = this.events.events![id];
      this.dataSource.data.push({
        name: event.name,
        id: id
      });
    }
    this.dataSource.data = this.dataSource.data;

    this.photoUrl = this.auth.auth.currentUser!.photoURL!;

    this.loading = false;
  }

  public async createEvent() {
    let eventName: string = await this.dialog.open(PromptDialogComponent, {
      data: {
        title: this.translation.createEvent[this.lang],
        input: {
          placeholder: this.translation.eventName[this.lang],
          pattern: "\\S+"
        }
      }
    }).afterClosed().toPromise();

    if (!eventName) {
      return;
    }

    let newEvent = await this.events.createEvent(eventName);
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
    } as any
  };
}
