import { Component, OnInit } from '@angular/core';
import { Transaction } from 'nem-library';
import { Router } from '@angular/router';
import { GlobalDataService } from '../../services/global-data.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
    public loading = true;

    public incomingTransactions?: Transaction[];
    public outgoingTransactions?: Transaction[];
    public unconfirmedTransactions?: Transaction[];

    constructor(
        public global: GlobalDataService,
        private router: Router
    ) { }

    ngOnInit() {
        this.global.auth.authState.subscribe((user) => {
            if(user == null) {
                this.router.navigate(["/accounts/login"]);
                return;
            }
            this.global.initialize().then(() => {
                this.refresh();
            });
        });
    }

    public async refresh() {
        this.loading = true;
        this.incomingTransactions = new Array<Transaction>();
        this.outgoingTransactions = new Array<Transaction>();
        this.unconfirmedTransactions = new Array<Transaction>();

        this.incomingTransactions = await this.global.accountHttp.incomingTransactions(this.global.account!.address).toPromise();

        this.outgoingTransactions = await this.global.accountHttp.outgoingTransactions(this.global.account!.address).toPromise();

        this.unconfirmedTransactions = await this.global.accountHttp.unconfirmedTransactions(this.global.account!.address).toPromise();

        this.loading = false;
    }

    public translation = {
        history: {
            en: "History",
            ja: "履歴"
        },
        incoming: {
            en: "Incoming",
            ja: "受信"
        },
        outgoing: {
            en: "Outgoing",
            ja: "送信"
        },
        unconfirmed: {
            en: "Unconfirmed",
            ja: "未承認"
        },
        noIncoming: {
            en: "There is no incoming transaction.",
            ja: "受信した取引はありません。"
        },
        noOutgoing: {
            en: "There is no outgoing transaction.",
            ja: "送信した取引はありません。"
        },
        noUnconfirmed: {
            en: "There is no unconfirmed transaction.",
            ja: "未承認の取引はありません。"
        }
    } as {[key: string]: {[key: string]: string}};
}
