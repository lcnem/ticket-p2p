import { Component, OnInit } from '@angular/core';
import { DataService } from "../data/data.service";
import { LcnemApi, MosaicData, MosaicTranslationData } from '../models/api';
import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { encodeUriQuery } from '@angular/router/src/url_tree';
import {
    Account,
    Address
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

    public price = 0;
    public message = "";

    public selected: boolean;

    public address: Address;
    public mosaic: MosaicData;
    public qrUrlExclusive: string;
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

        let namespace = this.route.snapshot.paramMap.get('namespace');
        let mosaic = this.route.snapshot.paramMap.get('mosaic');

        this.mosaic = this.dataService.mosaicData.find(m => m.namespace == namespace && m.name == mosaic);

        if (!this.mosaic) {
            this.router.navigate(["/page-not-found"]);
            return;
        }
        this.selected = this.dataService.selectedMosaicData.find(m => m.namespace == namespace && m.name == mosaic) != null;

        this.address = this.dataService.currentAccount.address;
        this.generateQr();

        this.loading = false;
    }

    public generateQr() {
        if (this.price == null) {
            this.snackBar.open("額の値が不正です。", "", { duration: 2000 });
            return;
        }
        var amount = this.price * Math.pow(10, this.mosaic.divisibility) / this.mosaic.rate;

        var qr = Invoice.generate(this.address.plain(), amount, this.message, this.mosaic.namespace + ':' + this.mosaic.name);
        this.qrUrlExclusive = "http://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=" + qr;
        this.qrUrl = "http://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=" + encodeURI(location.protocol + "//" + location.host + '/transfer?json=' + qr);
    }

    public async changeRegisration() {
        await LcnemApi.changeSelectedMosaic(this.http, this.dataService.currentAccount, this.mosaic.namespace, this.mosaic.name, this.selected);
        await this.dataService.loadSelectedMosaicData();
    }
}
