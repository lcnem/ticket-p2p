import { Component, OnInit } from '@angular/core';
import { DataService } from '../data/data.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TransferDialogComponent } from '../components/transfer-dialog/transfer-dialog.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { TransferTransaction, MosaicTransferable, TimeWindow, Address, PlainMessage, EmptyMessage, XEM, PublicAccount, MosaicId } from 'nem-library';
import { LoadingDialogComponent } from '../components/loading-dialog/loading-dialog.component';

@Component({
    selector: 'app-exchange',
    templateUrl: './exchange.component.html',
    styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit {
    public loading = true;

    public selected: string | undefined;
    public amount: number | undefined;

    public rates: { [key: string]: number } = {};
    public currencies = new Array<string>();

    constructor(
        public snackBar: MatSnackBar,
        private http: HttpClient,
        private router: Router,
        public dialog: MatDialog,
        public dataService: DataService
    ) { }

    ngOnInit() {
        this.dataService.auth.authState.subscribe((user) => {
            if (user == null) {
                this.router.navigate(["/login"]);
                return;
            }
            this.dataService.initialize().then(async () => {
                for (let m of this.dataService.mosaicData!) {
                    if (m.namespace == "lc") {
                        this.currencies.push(m.name.toUpperCase());
                    }
                }
                this.rates = await this.http.get<any>('https://us-central1-lcnem-wallet.cloudfunctions.net/rates').toPromise();
                this.loading = false;
            });
        });
    }

    public buy() {
        if (!this.amount) {
            this.snackBar.open("Amount is required", "", { duration: 2000 });
            return;
        }

        let transferable = new XEM(this.amount / this.rates[this.selected!]);
        let transaction = TransferTransaction.create(
            TimeWindow.createWithDeadline(),
            this.dataService.account!.address,
            transferable,
            EmptyMessage
        );
        this.process("buy", transaction, [transferable]);
    }

    public async sell() {
        if (!this.amount) {
            this.snackBar.open("Amount is required", "", { duration: 2000 });
            return;
        }
        let transferable = [
            await this.dataService.mosaicHttp.getMosaicTransferableWithAmount(new MosaicId("lc", this.selected!.toLowerCase()), this.amount).toPromise(),
            new XEM(10)
        ];
        let transaction = TransferTransaction.createWithMosaics(
            TimeWindow.createWithDeadline(),
            this.dataService.account!.address,
            transferable,
            EmptyMessage
        );
        this.process("sell", transaction, transferable);
    }

    public process(type: string, transaction: TransferTransaction, transferable: MosaicTransferable[]) {
        let dialogRef = this.dialog.open(TransferDialogComponent, {
            data: {
                transaction: transaction,
                mosaics: transferable
            }
        });

        let result = dialogRef.afterClosed().subscribe(async result => {
            if (!result) {
                return;
            }
            let dialogRef_ = this.dialog.open(LoadingDialogComponent);

            if(! await this.checkIp()) {
                dialogRef_.close();
                this.snackBar.open("日本国資金決済法に基づき、日本のipアドレスではこの機能をお使いいただけません。", "", { duration: 10000 });
                return;
            }

            this.http.post(
                "https://us-central1-lcnem-wallet.cloudfunctions.net/" + type,
                {
                    currency: this.selected,
                    amount: this.amount,
                    key: this.dataService.account!.publicKey,
                    cipher: this.dataService.account!.encryptMessage(
                        this.dataService.account!.privateKey,
                        PublicAccount.createWithPublicKey("19a2e510015afd13fc31ed37a60e5e8e13ab748d2913737ee0368e6b1cd98e1d")
                    ).payload
                }
            ).subscribe(
                async observer => {
                    await this.dataService.refresh();
                    dialogRef_.close();
                    this.snackBar.open("Success", "", { duration: 2000 });
                    this.amount = undefined;
                },
                error => {
                    dialogRef_.close();
                    this.snackBar.open("Error", "", { duration: 2000 });
                    console.log(JSON.stringify(error));
                }
            );
        });
    }

    public async checkIp() {
        let ret = true;
        await this.http.get("https://wallet.lcnem.cc/ip/test.json").toPromise().catch(() => {
            ret = false;
        })
        return ret;
    }
}
