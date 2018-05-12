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

    public incomingTransactions: Transaction[] | undefined;
    public outgoingTransactions: Transaction[] | undefined;
    public unconfirmedTransactions: Transaction[] | undefined;

    constructor(private router: Router, private dataService: DataService) {

    }

    ngOnInit() {
        this.dataService.auth.authState.subscribe((user) => {
            if(user == null) {
                this.router.navigate(["/login"]);
                return;
            }
            this.dataService.initialize().then(() => {
                this.refresh();
            });
        });
    }

    public async refresh() {
        const address = this.dataService.account!.address;
        this.loading = true;
        this.incomingTransactions = new Array<Transaction>();
        this.outgoingTransactions = new Array<Transaction>();
        this.unconfirmedTransactions = new Array<Transaction>();

        this.incomingTransactions = await this.dataService.accountHttp.incomingTransactions(address).toPromise();

        this.outgoingTransactions = await this.dataService.accountHttp.outgoingTransactions(address).toPromise();

        this.unconfirmedTransactions = await this.dataService.accountHttp.unconfirmedTransactions(address).toPromise();

        this.loading = false;
    }
}
