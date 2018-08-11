import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalDataService } from '../services/global-data.service';
import { InputDialogComponent } from '../components/input-dialog/input-dialog.component';
import { MatDialog } from '@angular/material';
import { Event } from '../../models/event';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    public loading = true

    constructor(
        public global: GlobalDataService,
        private router: Router,
        private dialog: MatDialog,
        private auth: AngularFireAuth,
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
        this.dialog.open(InputDialogComponent, {
            data: {
                title: this.translation.createEvent[this.global.lang],
                placeholder: this.translation.eventName[this.global.lang],
                cancel: this.translation.cancel[this.global.lang],
                submit: this.translation.submit[this.global.lang]
            }
        }).afterClosed().subscribe(async (eventName) => {
            if (!eventName) {
                return;
            }

            let uid = this.auth.auth.currentUser!.uid;

            let newEvent = await this.firestore.collection("users").doc(uid).collection("events").add({
                name: eventName
            });
            this.router.navigate(["events", newEvent.id]);
        });
    }

    public async archiveEvent(eventId: string) {
        let uid = this.auth.auth.currentUser!.uid;

        this.firestore.collection("users").doc(uid).collection("events").doc(eventId).set({
            archived: true
        });
    }

    public translation = {
        language: {
            en: "Language",
            ja: "言語"
        },
        archived: {
            en: "Archived",
            ja: "アーカイブ"
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
        cancel: {
            en: "Cancel",
            ja: "キャンセル"
        },
        submit: {
            en: "Submit",
            ja: "作成"
        }
    } as { [key: string]: { [key: string]: string } };
}
