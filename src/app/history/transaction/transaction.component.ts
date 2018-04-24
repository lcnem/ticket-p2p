import { Component, OnInit, Input } from '@angular/core';
import { Transaction, TransactionTypes, TransferTransaction, MultisigTransaction, Mosaic, XEM, Message, PlainMessage, PublicAccount, AccountHttp } from 'nem-library';
import { DataService } from '../../data/data.service';
import { MosaicData } from '../../models/api';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
    @Input() transaction: Transaction;
    public tt: TransferTransaction;
    public mosaicData = new Array<MosaicData>();
    public price = new Array<number>();
    public message = new Array<string>();

    constructor(private dataService: DataService) { }

    ngOnInit() {
        if (this.transaction.type == TransactionTypes.TRANSFER) {
            this.tt = this.transaction as TransferTransaction;
            this.set(this.tt);
        } else if (this.transaction.type == TransactionTypes.MULTISIG) {
            let mt = this.transaction as MultisigTransaction;
            if (mt.otherTransaction.type == TransactionTypes.TRANSFER) {
                this.tt = mt.otherTransaction as TransferTransaction;
                this.set(this.tt);
            }
        }
    }

    public async set(transferTransaction: TransferTransaction) {
        let message: string;
        if(transferTransaction.message.isEncrypted()) {
            let account = this.dataService.currentAccount;
            let recipient = await new AccountHttp(this.dataService.nodes).getFromAddress(transferTransaction.recipient).toPromise();
            let msg = account.decryptMessage(transferTransaction.message, account);
            message = msg.payload;
        } else {
            let msg = transferTransaction.message as PlainMessage;
            message = msg.plain();
        }


        if(transferTransaction.containsMosaics()) {
            let mosaics = transferTransaction.mosaics();
            this.setMosaic(transferTransaction.mosaics());
            mosaics.forEach(m => {
                this.message.push(message);
            });
        } else {
            let data = this.dataService.mosaicData.find(m => m.namespace == "nem" && m.name == "xem");
            this.mosaicData.push(data);
            this.price.push(transferTransaction.xem().amount);
            this.message.push(message);
        }
    }

    public setMosaic(mosaics: Mosaic[]) {
        mosaics.forEach(m => {
            let data = this.dataService.mosaicData.find(d => d.namespace == m.mosaicId.namespaceId && d.name == m.mosaicId.name);
            if (data) {
                this.mosaicData.push(data);
                this.price.push(data.getPrice(m.quantity));
            }
        });
    }

}
