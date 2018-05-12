import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { DataService, MosaicData, OwnedMosaic } from "../data/data.service"
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
    XEM,
    MosaicDefinition
} from 'nem-library';
import { Invoice } from '../../models/invoice';
import { TransferDialogComponent } from '../components/transfer-dialog/transfer-dialog.component';
import { LoadingDialogComponent } from '../components/loading-dialog/loading-dialog.component';

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
    public loading = true;

    public address: string | undefined;
    public transferMosaics = new Array<{
        amount: number,
        definition: MosaicDefinition
    }>();
    public message = "";
    public encrypt = false;

    constructor(
        public snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        public dataService: DataService
    ) {

    }

    ngOnInit() {
        this.dataService.auth.authState.subscribe((user) => {
            if (user == null) {
                this.router.navigate(["/login"]);
                return;
            }
            this.dataService.initialize().then(() => {
                let json = this.route.snapshot.queryParamMap.get('json');

                if (json != null) {
                    this.readInvoice(json);
                }

                this.loading = false;
            });
        });
    }

    public readInvoice(json: string) {
        let invoice = Invoice.read(json);
        if (invoice == null) {
            return;
        }
        this.address = invoice.data.addr;
        this.message = invoice.data.msg;
        invoice.data.mosaics.forEach(m => {
            let splitted = m.name.split(":");
            if (splitted.length == 2) {
                this.add(splitted[0], splitted[1], m.amount);
            }
        });
    }

    public async resolveAlias() {
        if (this.address && this.address.startsWith("@")) {
            let namespace = this.address.substr(1, this.address.length - 1);

            try {
                let result = await this.dataService.namespaceHttp.getNamespace(namespace).toPromise();
                this.address = result.owner.pretty();
            } catch {
                this.snackBar.open("Failed to solve alias", "", { duration: 2000 });
            }
        } else {
            this.snackBar.open("Must start with @", "", { duration: 2000 });
        }
    }

    public async transfer() {
        if (!this.address) {
            this.snackBar.open("Address is required.", "", { duration: 2000 });
            return;
        }

        let message: Message;
        if (this.encrypt) {
            try {
                let recipient = await this.dataService.accountHttp.getFromAddress(new Address(this.address)).toPromise();
                if (!recipient.publicAccount.hasPublicKey) {
                    this.snackBar.open("Encrypting message to new address is not available.", "", { duration: 2000 });
                    return;
                }

                message = this.dataService.account!.encryptMessage(this.message, recipient.publicAccount);
            } catch {
                this.snackBar.open("Invalid address", "", { duration: 2000 });
                return;
            }
        } else {
            message = PlainMessage.create(this.message);
        }

        let transferable = new Array<MosaicTransferable>();

        for (let i = 0; i < this.transferMosaics.length; i++) {
            if (this.transferMosaics[i].amount) {
                let definition = this.transferMosaics[i].definition;

                if (definition.id.namespaceId == "nem" && definition.id.name == "xem") {
                    transferable.push(new XEM(this.transferMosaics[i].amount));
                } else {
                    let mosaicTransferable = new MosaicTransferable(definition.id, definition.properties, this.transferMosaics[i].amount, definition.levy);
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

        let dialogRef = this.dialog.open(TransferDialogComponent, {
            data: {
                transaction: transaction,
                mosaics: transferable
            }
        });

        let result = dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            let dialogRef_ = this.dialog.open(LoadingDialogComponent);

            let signed = this.dataService.account!.signTransaction(transaction);
            this.dataService.transactionHttp.announceTransaction(signed).subscribe(async observer => {
                await this.dataService.refresh();
                dialogRef_.close();
                this.snackBar.open("Success", "", { duration: 2000 });
                this.router.navigate(["/"]);
            }, error => {
                dialogRef_.close();
                this.snackBar.open("Error", "", { duration: 2000 });
                console.log(JSON.stringify(error));
            });
        });
    }

    public add(namespace: string, name: string, quantity: number) {
        let definition = this.dataService.getDefinition(namespace, name);
        if (!definition) {
            return;
        }
        this.transferMosaics.push({
            amount: quantity / Math.pow(10, definition.properties.divisibility),
            definition: definition
        });
    }

    public isAdded(namespace: string, name: string) {
        return this.transferMosaics.find(m => m.definition.id.namespaceId == namespace && m.definition.id.name == name) != null;
    }
}
