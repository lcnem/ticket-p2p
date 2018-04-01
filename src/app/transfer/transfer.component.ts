import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { DataService } from "../data/data.service"
import {
    Mosaic,
    Account,
    TransactionHttp,
    Transaction,
    TransferTransaction,
    TimeWindow,
    Message,
    NEMLibrary,
    EncryptedMessage,
    Address,
    PlainMessage,
    Password,
    PublicAccount,
    AccountHttp,
    MosaicHttp,
    MosaicTransferable,
    MosaicId,
    NamespaceHttp,
    XEM
} from 'nem-library';
import { MosaicData } from '../models/api';
import { Invoice } from '../models/invoice';

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
    public selectedMosaics: MosaicData[];

    public selectedIndex = 0;
    public address: string;
    public transferMosaics = new Array<MosaicData>();
    public price = new Array<number>();
    public message: string;
    public encrypt: boolean;

    public sending = false;

    constructor(
        public snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
        private dataService: DataService
    ) {

    }

    ngOnInit() {
        if (this.dataService.walletIndex == null) {
            this.router.navigate(["/login"]);
            return;
        }
        this.dataService.login().then(() => {
            this.selectedMosaics = this.dataService.selectedMosaicData;
            let json = this.route.snapshot.paramMap.get('json');
            if (json != null) {
                this.readInvoice(json);
            }
        });

    }

    public readInvoice(json: string) {
        let invoice = Invoice.read(json);
        if (invoice == null) {
            return;
        }
        this.address = invoice.data.addr;
        let mosaic = this.selectedMosaics.find(m => m.namespace + ":" + m.name == invoice.data.name);
        if (mosaic == null) {
            mosaic = this.dataService.mosaicData.find(m => m.namespace == "nem" && m.name == "xem");
        }
        this.transferMosaics.push(mosaic);
        this.price.push(mosaic.getPrice(invoice.data.amount));
        this.message = invoice.data.msg;
    }

    public async resolveAlias() {
        if (this.address.startsWith("@")) {
            let namespace = this.address.substr(1, this.address.length - 1);
            let namespaceHttp = new NamespaceHttp(this.dataService.nodes);

            try {
                let result = await namespaceHttp.getNamespace(namespace).toPromise();
                this.address = result.owner.pretty();
            } catch {
                this.snackBar.open("エイリアスを解決できませんでした。", "", { duration: 2000 });
            }
        } else {
            this.snackBar.open("エイリアスは@から始めてください。", "", { duration: 2000 });
        }
    }

    public addMosaic(selectedIndex: number) {
        this.transferMosaics.push(this.selectedMosaics[selectedIndex]);
        this.price.push(null);
    }

    public async transfer() {
        this.sending = true;
        this.snackBar.open("送信中です。", "", { duration: 2000 });
        try {
            let message: Message;
            if (this.encrypt) {
                let recipient = await new AccountHttp().getFromAddress(new Address(this.address)).toPromise();
                if (!recipient.publicAccount.hasPublicKey) {
                    this.snackBar.open("新規アドレスには暗号化メッセージを送信できません。", "", { duration: 2000 });
                    this.sending = false;
                    return;
                }
                message = this.dataService.currentAccount.encryptMessage(this.message, recipient.publicAccount);
            } else {
                message = PlainMessage.create(this.message);
            }

            let transferable = new Array<MosaicTransferable>();
            let mosaicHttp = new MosaicHttp(this.dataService.nodes);

            for(let i = 0; i < this.transferMosaics.length; i++) {
                if (this.price[i] != null) {
                    let mosaic = this.transferMosaics[i];
                    let mosaicId = new MosaicId(mosaic.namespace, mosaic.name);
                    let amount = mosaic.getAmount(this.price[i]) / Math.pow(10, mosaic.divisibility);console.log(amount)
                    if (mosaicId.namespaceId == "nem" && mosaicId.name == "xem") {
                        transferable.push(new XEM(amount));
                    } else {
                        let mosaicTransferable = await mosaicHttp.getMosaicTransferableWithAmount(mosaicId, amount).toPromise();
                        transferable.push(mosaicTransferable);
                    }
                }
            }

            let transaction = TransferTransaction.createWithMosaics(
                TimeWindow.createWithDeadline(),
                new Address(this.address),
                transferable,
                message
            );
            console.log(JSON.stringify(transaction));

            let transactionHttp = new TransactionHttp(this.dataService.nodes);
            let signed = this.dataService.currentAccount.signTransaction(transaction);
            transactionHttp.announceTransaction(signed).subscribe(observer => {
                this.snackBar.open("送信に成功しました。", "", { duration: 2000 });
                this.router.navigate(["/"]);
            }, error => {
                this.snackBar.open(error.message, "", { duration: 2000 });
            })
        } catch {
            this.snackBar.open("エラーが発生しました。", "", { duration: 2000 });
            this.sending = false;
            return;
        }
    }

    trackByIndex(index: number, obj: any): any {
        return index;
    }
}
