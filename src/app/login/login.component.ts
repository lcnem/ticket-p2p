import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DataService } from "../data/data.service";
import { NEMLibrary, Wallet, SimpleWallet, Password, PublicAccount } from 'nem-library';
import { MatSnackBar, MatStepper } from '@angular/material';
import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';
import { LcnemApi } from '../models/api';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    public selectedIndex: number;
    public wallets: Wallet[];

    public adding = false;
    public name: string;
    public privateKey: string;
    public newPassword: string;

    public password: string;

    constructor(
        public snackBar: MatSnackBar,
        public router: Router,
        private http: HttpClient,
        private dataService: DataService
    ) {
        
    }

    ngOnInit() {
        if (this.dataService.walletIndex != null) {
            this.router.navigate(["/"]);
            return;
        }

        this.dataService.loadWallets();
        this.loadWallets();
    }

    public loadWallets() {
        this.wallets = new Array<Wallet>();

        this.dataService.wallets.forEach(w => {
            var wallet = SimpleWallet.readFromWLT(w);
            this.wallets.push(wallet);
        });
    }

    public async addWallet() {
        this.adding = true;
        let wallet: SimpleWallet;
        if (this.name == null) {
            this.snackBar.open("Account name is required", "", { duration: 2000 });
            return;
        }
        if (this.newPassword == null) {
            this.snackBar.open("Password is required", "", { duration: 2000 });
            return;
        }
        let password = new Password(this.newPassword);

        if (this.privateKey != null) {
            try {
                wallet = SimpleWallet.createWithPrivateKey(this.name, password, this.privateKey);
                if (wallet == null)
                    throw null;
            }
            catch
            {
                this.snackBar.open("Invalid private key", "", { duration: 2000 });
                this.adding= false;
                return;
            }
        } else {
            wallet = SimpleWallet.create(this.name, password);
        }

        this.dataService.wallets.push(wallet.writeWLTFile());
        this.dataService.saveWallets();

        this.loadWallets();

        this.snackBar.open("Success", "", { duration: 2000 });

        let account = wallet.open(new Password(this.newPassword));
        this.backupPrivateKey(account.privateKey, account.address.plain());

        this.name = "";
        this.newPassword = "";
        this.privateKey = "";
        this.adding = false;
    }

    public delete() {
        if (!this.checkPassword()) {
            return;
        }
        this.dataService.wallets.splice(this.selectedIndex, 1);
        this.dataService.saveWallets();
        this.selectedIndex = null;
        this.password = null;
        this.snackBar.open("Account has been deleted", "", { duration: 2000 });
        this.loadWallets();
    }

    public submitLogin() {
        if (!this.checkPassword()) {
            return;
        }

        this.dataService.password = this.password;
        this.dataService.walletIndex = this.selectedIndex;
        this.router.navigate(["/"]);
    }

    public submitBackupPrivateKey() {
        if (!this.checkPassword()) {
            return;
        }

        let account = this.wallets[this.selectedIndex].open(new Password(this.password));
        this.backupPrivateKey(account.privateKey, account.address.plain());
    }

    public backupPrivateKey(key: string, address: string)
    {
        let json = JSON.stringify(key);
        let blob = new Blob([json], { "type": "text/plain" });

        let a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.target = "_blank";
        a.download = address + ".txt";
        a.click();
    }

    private checkPassword(): boolean {
        if (this.selectedIndex == null)
            return false;

        try {
            let account = this.wallets[this.selectedIndex].open(new Password(this.password));
            if (account == null)
                throw null;
        } catch {
            this.snackBar.open("Invalid password", "", { duration: 2000 });
            return false;
        }
        return true;
    }
}
