import { Component, OnInit } from '@angular/core';
import { DataService } from "../data/data.service";
import { RouterModule, Routes, ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { encodeUriQuery } from '@angular/router/src/url_tree';
import {
    Account,
    Address,
    QRService,
    MosaicHttp,
    MosaicId,
    MosaicDefinition
} from 'nem-library';
import { HttpClient } from '@angular/common/http';
import { Invoice } from '../../models/invoice';

@Component({
    selector: 'app-mosaic',
    templateUrl: './mosaic.component.html',
    styleUrls: ['./mosaic.component.css']
})
export class MosaicComponent implements OnInit {
    public loading = true;

    public namespace: string | undefined;
    public name: string | undefined;

    public definition: MosaicDefinition | undefined;
    public amount: number = 0;
    public unit: string | null | undefined;

    public invoice = {
        amount: 0,
        message: ""
    };

    public qrUrl: string | undefined;

    constructor(
        public snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
        private http: HttpClient,
        public dataService: DataService
    ) {

    }

    ngOnInit() {
        this.dataService.auth.authState.subscribe((user) => {
            if (user == null) {
                this.router.navigate(["/login"]);
                return;
            }
            this.namespace = this.route.snapshot.paramMap.get('namespace') || undefined;
            this.name = this.route.snapshot.paramMap.get('mosaic') || undefined;

            this.dataService.initialize().then(async () => {
                if (this.namespace && this.name) {
                    this.definition = this.dataService.getDefinition(this.namespace, this.name) || undefined;
                    if (!this.definition) {
                        this.definition = await this.dataService.mosaicHttp.getMosaicDefinition(new MosaicId(this.namespace, this.name)).toPromise();
                    }

                    this.amount = this.dataService.getAmount(this.namespace, this.name);
                    this.unit = this.dataService.getUnit(this.namespace, this.name);
                    this.generateQr();

                    this.loading = false;
                }
            });
        });
    }

    public generateQr() {
        if (this.invoice.amount == null) {
            this.snackBar.open("Invalid amount", "", { duration: 2000 });
            return;
        }
        let amount = this.invoice.amount * Math.pow(10, this.definition!.properties.divisibility);

        const address = this.dataService.account!.address;

        if (this.namespace == "nem" && this.name == "xem") {
            let json = JSON.stringify({
                v: 2,
                type: 2,
                data: {
                    addr: address.plain(),
                    msg: this.invoice.message,
                    name: "LCNEM Wallet",
                    amount: amount
                }
            });
            this.qrUrl = "https://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=" + encodeURI(json);
            return;
        }
        let invoice = new Invoice();
        invoice.data.addr = address.plain();
        invoice.data.msg = this.invoice.message;
        invoice.data.name = "LCNEM Wallet";
        invoice.data.mosaics.push({ name: this.namespace + ':' + this.name, amount: amount });

        let qr = invoice.generate();
        this.qrUrl = "https://chart.apis.google.com/chart?chs=300x300&cht=qr&chl=" + qr;
    }

    public send() {
        let invoice = new Invoice();
        invoice.data.name = "LCNEM Wallet";
        invoice.data.mosaics.push({ name: this.namespace + ':' + this.name, amount: 0 });
        var qr = invoice.generate();
        this.router.navigate(["/transfer"], { queryParams: { "json": qr } });
    }
}
