import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NEMLibrary, NetworkTypes, AccountHttp, Address, Transaction, TransferTransaction, MultisigTransaction, PublicAccount } from "nem-library";
import { DataService } from "../data/data.service"
import { TransactionComponent } from './transaction/transaction.component';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
    public loading = true;
    public address: Address;

    public incomingTransactions: Transaction[];

    public outgoingTransactions: Transaction[];

    public unconfirmedTransactions: Transaction[];

    constructor(private router: Router, private dataService: DataService) {

    }

    ngOnInit() {
        if (this.dataService.walletIndex == null) {
            this.router.navigate(["/login"]);
            return;
        }
        this.dataService.login().then(() => {
            this.address = this.dataService.currentAccount.address;

            this.refresh();
        });
    }

    public async refresh() {
        this.loading = true;
        this.incomingTransactions = new Array<Transaction>();
        this.outgoingTransactions = new Array<Transaction>();
        this.unconfirmedTransactions = new Array<Transaction>();

        var accountHttp = new AccountHttp();

        this.incomingTransactions = await accountHttp.incomingTransactions(this.address).toPromise();

        this.outgoingTransactions = await accountHttp.outgoingTransactions(this.address).toPromise();

        this.unconfirmedTransactions = await accountHttp.unconfirmedTransactions(this.address).toPromise();

        this.loading = false;
    }
}
