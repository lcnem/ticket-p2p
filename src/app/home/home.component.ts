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
import { MosaicData, MosaicTranslationData } from '../models/api';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    public loading = true;

    public mosaicName: string;
    public selectedMosaics: MosaicData[];
    public displayPrice: number[];

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
            this.selectedMosaics = this.dataService.selectedMosaicData;
            this.loadPrice();

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

    public loadPrice() {
        this.displayPrice = new Array<number>();
        this.selectedMosaics.forEach(m => {
            let found = this.dataService.owned.find(o => o.mosaicId.namespaceId == m.namespace && o.mosaicId.name == m.name);
            if (found == null) {
                this.displayPrice.push(0);
            } else {
                this.displayPrice.push(m.getPrice(found.quantity));
            }
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
        await this.dataService.loadSelectedMosaicData();
        await this.dataService.loadOwned();

        this.selectedMosaics = this.dataService.selectedMosaicData;

        this.loading = false;
    }

    public designate() {
        let mosaic = this.dataService.mosaicData.find(m => m.namespace + ":" + m.name == this.mosaicName);
        if (!mosaic) {
            this.snackBar.open("一致するモザイクがありません。", "", { duration: 2000 });
        }
        let splitted = this.mosaicName.split(":");

        this.router.navigate(["/mosaic", splitted[0], splitted[1]]);
    }
}
