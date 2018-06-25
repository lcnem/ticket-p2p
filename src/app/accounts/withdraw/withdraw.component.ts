import { Component, OnInit } from '@angular/core';
import { GlobalDataService } from '../../services/global-data.service';
import { Router } from '@angular/router';
import { supportedCurrencies } from '../../../models/supported-currencies';
import { MatDialog } from '@angular/material';
import { LoadingDialogComponent } from '../../components/loading-dialog/loading-dialog.component';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { HttpClient } from '@angular/common/http';

import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { TransferDialogComponent } from '../../components/transfer-dialog/transfer-dialog.component';
import { TransferTransaction, TimeWindow, Address, MosaicTransferable, EmptyMessage, MosaicId } from 'nem-library';

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

    public safeSite: SafeResourceUrl;

    constructor(
        public global: GlobalDataService,
        private router: Router,
        private dialog: MatDialog,
        private http: HttpClient,
        sanitizer: DomSanitizer
    ) {
        this.safeSite = sanitizer.bypassSecurityTrustResourceUrl(`assets/terms/stable-coin/${global.lang}.txt`);
    }

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

        let transaction: TransferTransaction;
        let mosaics: MosaicTransferable[];
        try {
            if(this.selectedCurrency == "JPY") {
                mosaics = [
                    await this.global.mosaicHttp.getMosaicTransferableWithAmount(new MosaicId("lc", "jpy"), Number(this.amount!) + 500).toPromise()
                ];
            } else {
                mosaics = [
                    await this.global.mosaicHttp.getMosaicTransferableWithAmount(new MosaicId("lc", this.selectedCurrency.toLowerCase()), this.amount!).toPromise(),
                    await this.global.mosaicHttp.getMosaicTransferableWithAmount(new MosaicId("lc", "jpy"), 500).toPromise()
                ];
            }

            transaction = TransferTransaction.createWithMosaics(
                TimeWindow.createWithDeadline(),
                new Address("NADLY2-AGU3UI-NE4IRA-VFQ7WB-V7FJU4-HGGED3-4H6R"),
                mosaics,
                EmptyMessage
            );
        } catch {
            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.error[this.global.lang],
                    content: ""
                }
            });
            return;
        }

        let dialogRef = this.dialog.open(TransferDialogComponent, {
            data: {
                transaction: transaction,
                mosaics: mosaics
            }
        });
        dialogRef.afterClosed().subscribe(async result => {
            if (!result) {
                return;
            }
            
            let _dialogRef = this.dialog.open(LoadingDialogComponent, { disableClose: true });

            try {
                let signed = this.global.account!.signTransaction(transaction);
                await this.global.transactionHttp.announceTransaction(signed).toPromise();

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
                _dialogRef.close();
            }
    
            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.completed[this.global.lang],
                    content: this.translation.completedMessage[this.global.lang]
                }
            }).afterClosed().subscribe(() => {
                this.router.navigate(["/"]);
            });
        })
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
