import { Component, OnInit, Input } from '@angular/core';
import { Transaction, TransactionTypes, TransferTransaction, MultisigTransaction, Mosaic, XEM, Message, PlainMessage, PublicAccount, AccountHttp, MosaicHttp, Address } from 'nem-library';
import { DataService } from '../../data/data.service';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
    @Input() transaction: Transaction | undefined;
    public tt: TransferTransaction | undefined;

    public part: {
        namespace: string,
        name: string,
        issuer: string,
        amount: number,
        unit: string | null
    }[] = new Array();

    public message: string | undefined;
    public from: Address | undefined;

    constructor(private dataService: DataService) { }

    ngOnInit() {
        if(!this.transaction) {
            return;
        }
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
        if (transferTransaction.message.isEncrypted()) {
            let account = this.dataService.account;
            if (account!.address.plain() == transferTransaction.recipient.plain()) {
                message = account!.decryptMessage(transferTransaction.message, transferTransaction.signer!).payload;
            } else {
                let recipient = await this.dataService.accountHttp.getFromAddress(transferTransaction.recipient).toPromise();
                message = account!.decryptMessage(transferTransaction.message, recipient.publicAccount).payload;
            }
        } else {
            let msg = transferTransaction.message as PlainMessage;
            message = msg.plain();
        }
        this.message = message;


        if (transferTransaction.containsMosaics()) {
            let mosaics = transferTransaction.mosaics();
            for (let i = 0; i < mosaics.length; i++) {
                try {
                    let definition = this.dataService.getDefinition(mosaics[i].mosaicId.namespaceId,mosaics[i].mosaicId.name);
                    
                    if (!definition) {
                        definition = await this.dataService.mosaicHttp.getMosaicDefinition(mosaics[i].mosaicId).toPromise();
                    }
                    const amount = mosaics[i].quantity / Math.pow(10, definition.properties.divisibility);

                    this.part.push({
                        namespace: mosaics[i].mosaicId.namespaceId,
                        name: mosaics[i].mosaicId.name,
                        issuer: this.dataService.getIssuer(mosaics[i].mosaicId.namespaceId, mosaics[i].mosaicId.name),
                        amount: amount,
                        unit: this.dataService.getUnit(mosaics[i].mosaicId.namespaceId, mosaics[i].mosaicId.name),
                    });
                } catch {

                }
            }
        } else {
            this.part.push({
                namespace: "nem",
                name: "xem",
                issuer: this.dataService.getIssuer("nem", "xem"),
                amount: transferTransaction.xem().amount,
                unit: this.dataService.getUnit("nem", "xem")
            });
        }
    }
}
