import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalDataService } from '../services/global-data.service';
import { nodes } from '../../models/nodes';
import { ServerConfig, AccountHttp, MosaicHttp, TransactionHttp, NamespaceHttp } from 'nem-library';
import { MatSidenav } from '@angular/material';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { InputDialogComponent } from '../components/input-dialog/input-dialog.component';
import { MatDialog } from '@angular/material';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    public loading = true;
    public qrUrl = "";
    public nodes = nodes;

    @ViewChild("sidenav")
    public sidenav?: MatSidenav;

    watcher?: Subscription;

    constructor(
        public global: GlobalDataService,
        private router: Router,
        private media: ObservableMedia,
        public dialog: MatDialog,
        public auth: AngularFireAuth,
        public firestore: AngularFirestore,
    ) { }

    ngOnInit() {
        this.watcher = this.media.subscribe((change: MediaChange) => {
            if(!this.sidenav) {
                return;
            }
            if (change.mqAlias == "xs" || change.mqAlias == "sm") {
                this.sidenav.mode = "over";
                this.sidenav.opened = false;
            } else {
                this.sidenav.mode = "side";
                this.sidenav.opened = true;
            }
        });

        this.global.auth.authState.subscribe((user) => {
            if (user == null) {
                this.router.navigate(["/accounts/login"]);
                return;
            }
            this.global.initialize().then(() => {
                this.loading = false;
            });
        });
    }
    
    ngOnDestroy() {
        this.watcher!.unsubscribe();
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
                title: "イベントを作成",
                placeholder: "イベント名",
                cancel: "キャンセル",
                submit: "作成"
            }
        }).afterClosed().subscribe(async eventName => {
            let uid = this.auth.auth.currentUser!.uid;
            let docRef = this.firestore.collection("users").doc(uid).ref;
            let doc = await docRef.get();
                if (doc.exists) {                
                await docRef.collection("events").add({
                    name: eventName,
                    ownerId: uid
                }).then(newEvent => {
                    this.router.navigate(["events", newEvent.id]);
                })
            }
        });
    }

    public translation = {
        balance: {
            en: "Balance",
            ja: "残高"
        },
        deposit: {
            en: "Deposit",
            ja: "入金"
        },
        history: {
            en: "History",
            ja: "履歴"
        },
        language: {
            en: "Language",
            ja: "言語"
        },
        logout: {
            en: "Log out",
            ja: "ログアウト"
        },
        scan: {
            en: "Scan QR-code",
            ja: "QRコードをスキャン"
        },
        withdraw: {
            en: "Withdraw",
            ja: "出金"
        },
        yourAddress: {
            en: "Your address",
            ja: "あなたのアドレス"
        }
    } as {[key: string]: {[key: string]: string}};
}
