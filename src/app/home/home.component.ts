import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalDataService } from '../services/global-data.service';
import { Invoice } from '../../models/invoice';
import { nodes } from '../../models/nodes';
import { ServerConfig, AccountHttp, MosaicHttp, TransactionHttp, NamespaceHttp } from 'nem-library';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    public loading = true;
    public qrUrl = "";
    public nodes = nodes;

    constructor(
        public global: GlobalDataService,
        private router: Router
    ) { }

    ngOnInit() {
        this.global.auth.authState.subscribe((user) => {
            if (user == null) {
                this.router.navigate(["/accounts/login"]);
                return;
            }
            this.global.initialize().then(() => {
                let invoice = new Invoice();
                invoice.data.addr = this.global.account!.address.plain();
                this.qrUrl = "https://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=" + invoice.generate();
                this.loading = false;
            });
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
