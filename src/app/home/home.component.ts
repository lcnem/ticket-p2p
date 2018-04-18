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
    ConfirmedTransactionListener,
    UnconfirmedTransactionListener
} from "nem-library";
import { MatSnackBar } from '@angular/material';
import { DataService } from "../data/data.service";
import { StreamingService } from "../streaming/streaming.service";
import { MosaicData } from '../models/api';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    public loading = true;

    public mosaicName: string;
    public ownedMosaics: MosaicData[];

    constructor(
        public snackBar: MatSnackBar,
        private router: Router,
        public streamingService: StreamingService,
        public dataService: DataService
    ) {
    }

    ngOnInit() {
        if (this.dataService.walletIndex == null) {
            this.router.navigate(["/login"]);
            return;
        } 
        this.dataService.login().then(() => {
            this.ownedMosaics = this.dataService.ownedMosaicData;

            //this.streamingService.confirmedCallback = () => {
            //    this.snackBar.open("取引が承認されました。", "", { duration: 2000 });
            //};
            //this.streamingService.unconfirmedCallback = () => {
            //    this.snackBar.open("新しい取引を確認しました。", "", { duration: 2000 });
            //};
            //this.streamingService.startStreaming(this.dataService.currentAccount.address);

            this.loading = false;
        });
    }

    public logout() {
        this.streamingService.finishStreaming();
        this.dataService.logout();
        this.router.navigate(["/login"]);
    }

    public async refresh() {
        this.loading = true;

        await this.dataService.loadMosaicData();
        await this.dataService.loadOwned();

        this.ownedMosaics = this.dataService.ownedMosaicData;

        this.loading = false;
    }

    public designate() {
        let mosaic = this.dataService.mosaicData.find(m => m.namespace + ":" + m.name == this.mosaicName);
        if (!mosaic) {
            this.snackBar.open("Not found", "", { duration: 2000 });
        }
        let splitted = this.mosaicName.split(":");

        this.router.navigate(["/mosaic", splitted[0], splitted[1]]);
    }
}
