import { Component, OnInit, Input } from '@angular/core';

import {
    Address,
    EncryptedMessage,
    Transaction,
    TransactionTypes,
    TransferTransaction,
    MultisigTransaction,
    PlainMessage,
    Mosaic,
    XEM,
    MosaicId
} from 'nem-library';
import { GlobalDataService } from '../../../services/global-data.service';
import { MosaicAdditionalDefinition } from '../../../../models/mosaic-additional-definition';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
    @Input() transaction?: Transaction;

    public loading = true;

    public from?: string;
    public to?: string;
    public mosaics?: Mosaic[];
    public message?: string;
    public date?: any;
    public time?: any;

    constructor(public global: GlobalDataService) { }

    ngOnInit() {
        if(!this.transaction) {
            return;
        }
        if (this.transaction.type == TransactionTypes.TRANSFER) {
            this.set(this.transaction as TransferTransaction);
        } else if (this.transaction.type == TransactionTypes.MULTISIG) {
            let mt = this.transaction as MultisigTransaction;
            if (mt.otherTransaction.type == TransactionTypes.TRANSFER) {
                this.set(mt.otherTransaction as TransferTransaction);
            }
        }
    }

    public async set(transferTransaction: TransferTransaction) {
        let message: string;
        if (transferTransaction.message.isEncrypted()) {
            let account = this.global.account!;
            if (account!.address.plain() == transferTransaction.recipient.plain()) {
                message = account!.decryptMessage(transferTransaction.message, transferTransaction.signer!).payload;
            } else {
                let recipient = await this.global.accountHttp.getFromAddress(transferTransaction.recipient).toPromise();
                message = account!.decryptMessage(transferTransaction.message, recipient.publicAccount).payload;
            }
        } else {
            let msg = transferTransaction.message as PlainMessage;
            message = msg.plain();
        }
        this.message = message;

        this.from = transferTransaction.signer!.address.pretty();
        this.to = transferTransaction.recipient.pretty();

        if (transferTransaction.containsMosaics()) {
            this.mosaics = transferTransaction.mosaics();
        } else {
            this.mosaics = [new Mosaic(new MosaicId("nem", "xem"), transferTransaction.xem().quantity())];
        }

        this.date = transferTransaction.timeWindow.timeStamp.toLocalDate();
        this.time = transferTransaction.timeWindow.timeStamp.toLocalTime();

        this.loading = false;
    }

    public translation = {
        mosaics: {
            en: "Tokens",
            ja: "トークン"
        }
    } as {[key: string]: {[key: string]: string}};
}
