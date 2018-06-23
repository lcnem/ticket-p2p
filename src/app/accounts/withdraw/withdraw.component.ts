import { Component, OnInit } from '@angular/core';
import { GlobalDataService } from '../../services/global-data.service';
import { Router } from '@angular/router';
import { supportedCurrencies } from '../../../models/supported-currencies';
import { MatDialog } from '@angular/material';
import { LoadingDialogComponent } from '../../components/loading-dialog/loading-dialog.component';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-withdraw',
    templateUrl: './withdraw.component.html',
    styleUrls: ['./withdraw.component.css']
})
export class WithdrawComponent implements OnInit {
    public supportedCurrencies = supportedCurrencies; 
    public selectedCurrency = "JPY";

    public amount?: number;
    public type?: string;

    constructor(
        public global: GlobalDataService,
        private router: Router,
        private dialog: MatDialog,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.global.auth.authState.subscribe((user) => {
            if (user == null) {
                this.router.navigate(["/accounts/login"]);
                return;
            }
            this.global.initialize().then(() => {
            });
        });
    }

    public async withdrawRequest() {
        let dialogRef = this.dialog.open(LoadingDialogComponent, { disableClose: true });

        try {
            await this.http.post(
                "https://us-central1-lcnem-wallet.cloudfunctions.net/withdraw",
                {
                    currency: this.selectedCurrency,
                    amount: this.amount,
                    email: this.global.auth.auth.currentUser!.email,
                    nemAddress: this.global.account!.address.pretty(),
                    type: this.type,
                    lang: this.global.lang
                }
            ).toPromise();
        } catch {
            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.error[this.global.lang],
                    content: ""
                }
            });
            return;
        } finally {
            dialogRef.close();
        }

        this.dialog.open(DialogComponent, {
            data: {
                title: this.translation.completed[this.global.lang],
                content: this.translation.completedMessage[this.global.lang]
            }
        }).afterClosed().subscribe(() => {
            this.router.navigate(["/"]);
        });
    }

    public translation = {
        amazonGift: {
            en: "Amazon Gift Card",
            ja: "アマゾンギフトカード"
        },
        amount: {
            en: "Amount",
            ja: "金額"
        },
        currency: {
            en: "currency",
            ja: "通貨"
        },
        error: {
            en: "Error",
            ja: "エラー"
        },
        completed: {
            en: "Completed",
            ja: "完了"
        },
        completedMessage: {
            en: "We will send you an invitation e-mail so please wait a moment.",
            ja: "案内のメールをお送りしますので少々お待ちください。"
        },
        type: {
            en: "Type",
            ja: "種類"
        },
        request: {
            en: "Send a withdraw request",
            ja: "出金リクエストを送信"
        },
        withdraw: {
            en: "Withdraw",
            ja: "出金"
        }
    } as {[key: string]: {[key: string]: string}};
}
