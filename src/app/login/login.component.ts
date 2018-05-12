import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DataService } from "../data/data.service";
import { NEMLibrary, Wallet, SimpleWallet, Password, PublicAccount, Account } from 'nem-library';
import { MatSnackBar, MatStepper } from '@angular/material';
import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    public loading = true;

    constructor(
        public snackBar: MatSnackBar,
        public router: Router,
        private http: HttpClient,
        private dataService: DataService
    ) {
    }

    ngOnInit() {
        this.dataService.auth.authState.subscribe((user) => {
            console.log(JSON.stringify(user));
            if (user != null) {
                this.router.navigate(["/"]);
                return;
            }
            this.loading = false;
        });
    }

    public async login() {
        await this.dataService.login();
        this.router.navigate(["/"]);
    }
}
