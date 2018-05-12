import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';
import {
    NEMLibrary,
    NetworkTypes,
    AccountHttp,
    Mosaic,
    SimpleWallet,
    Address,
    MosaicId
} from "nem-library";
import { MatSnackBar } from '@angular/material';
import { DataService, MosaicData, OwnedMosaic } from "../data/data.service";
import { Invoice } from '../../models/invoice';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    public loading = true;

    public mosaicName: string | undefined;

    constructor(
        public snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
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
                this.loading = false;
            });
        });
    }

    public onClick(namespace: string, name: string) {
        this.router.navigate(["/mosaic", namespace, name]);
    }

    public async logout() {
        await this.dataService.logout();
        this.router.navigate(["/login"]);
    }

    public async refresh() {
        this.loading = true;
        
        await this.dataService.refresh();

        this.loading = false;
    }

    public designate() {
        if(!this.mosaicName) {
            return;
        }
        let splitted = this.mosaicName.split(":");
        if(splitted.length != 2) {
            this.snackBar.open("Invalid name", "", { duration: 2000 });
        }

        this.router.navigate(["/mosaic", splitted[0], splitted[1]]);
    }

    public donate() {
        let invoice = new Invoice();
        invoice.data.addr = "@lc";
        invoice.data.name = "LCNEM Wallet";
        invoice.data.mosaics.push({ name: "nem:xem", amount: 1000000 });
        var qr = invoice.generate();
        this.router.navigate(["/transfer"], { queryParams: { "json": qr } });
    }
}
