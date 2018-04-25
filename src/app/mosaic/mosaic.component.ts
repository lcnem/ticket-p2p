import { Component, OnInit } from '@angular/core';
import { DataService } from "../data/data.service";
import { LcnemApi, MosaicData } from '../models/api';
import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { encodeUriQuery } from '@angular/router/src/url_tree';
import {
    Account,
    Address,
    QRService
} from 'nem-library';
import { HttpClient } from '@angular/common/http';
import { Invoice } from '../models/invoice';

@Component({
    selector: 'app-mosaic',
    templateUrl: './mosaic.component.html',
    styleUrls: ['./mosaic.component.css']
})
export class MosaicComponent implements OnInit {
    public loading = true;

    public address: Address;
    public mosaic: MosaicData;
    public owned = 0;

    public price = 0;
    public message = "";

    public qrUrl: string;

    constructor(
        public snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
        private http: HttpClient,
        public dataService: DataService
    ) {

    }

    ngOnInit() {
        if (this.dataService.walletIndex == null) {
            this.router.navigate(["/login"]);
            return;
        }
        this.dataService.login().then(() => {

            let namespace = this.route.snapshot.paramMap.get('namespace');
            let mosaic = this.route.snapshot.paramMap.get('mosaic');

            this.mosaic = this.dataService.mosaicData.find(m => m.namespace == namespace && m.name == mosaic);

            if (!this.mosaic) {
                this.router.navigate(["/page-not-found"]);
                return;
            }
            let owned = this.dataService.owned.find(o => o.mosaicId.namespaceId == this.mosaic.namespace && o.mosaicId.name == this.mosaic.name);
            if (owned) {
                this.owned = this.mosaic.getPrice(owned.quantity);
            }

            this.address = this.dataService.currentAccount.address;
            this.generateQr();

            this.loading = false;
        });
    }

    public generateQr() {
        if (this.price == null) {
            this.snackBar.open("Invalid amount", "", { duration: 2000 });
            return;
        }
        var amount = this.price * Math.pow(10, this.mosaic.divisibility) / this.mosaic.rate;

        if(this.mosaic.namespace == "nem" && this.mosaic.name == "xem") {
            let qrService = new QRService();
            let json = qrService.generateTransactionQRText(this.address, amount, this.message);
            this.qrUrl = "https://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=" + encodeURI(json);
            return;
        }
        let invoice = new Invoice();
        invoice.data.addr = this.address.plain();
        invoice.data.msg = this.message;
        invoice.data.name = "LCNEM Wallet";
        invoice.data.mosaics.push({name: this.mosaic.namespace + ':' + this.mosaic.name, quantity: amount});

        let qr = invoice.generate();
        this.qrUrl = "https://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=" + qr;
    }

    public send() {
        let invoice = new Invoice();
        invoice.data.name = "LCNEM Wallet";
        invoice.data.mosaics.push({name: this.mosaic.namespace + ':' + this.mosaic.name, quantity: 0});
        var qr = invoice.generate();
        this.router.navigate(["/transfer"], { queryParams: { "json": qr } });
    }
}
