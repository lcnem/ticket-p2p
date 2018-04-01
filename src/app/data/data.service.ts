import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    NEMLibrary,
    NetworkTypes,
    AccountHttp,
    Address,
    Mosaic,
    SimpleWallet,
    Wallet,
    Account,
    Password,
    ServerConfig
} from "nem-library";
import { LoginComponent } from '../login/login.component';
import { MosaicData, MosaicTranslationData, LcnemApi } from '../models/api'

@Injectable()
export class DataService {
    public initialized = false;

    public wallets: string[];

    public mosaicData: MosaicData[];

    public currentAccount: Account;
    public selectedMosaicData: MosaicData[];
    public owned: Mosaic[];

    public nodes: ServerConfig[] = [
        {
            protocol: "https",
            domain: "nis2.wnsl.biz",
            port: 7779
        },
        {
            protocol: "https",
            domain: "shibuya.supernode.me",
            port: 7891
        }
    ];

    constructor(private http: HttpClient) {
        NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
    }

    public loadWallets() {
        this.wallets = JSON.parse(localStorage.getItem("Wallets"));
        if (this.wallets == null) {
            this.wallets = new Array<string>();
        }
    }

    public saveWallets() {
        localStorage.setItem("Wallets", JSON.stringify(this.wallets));
    }

    public async loadMosaicData() {
        this.mosaicData = await LcnemApi.loadMosaicData(this.http);
    }

    public get walletIndex(): number {
        let str = localStorage.getItem("WalletIndex");
        if(str == null) {
            return null;
        }
        let num = Number(str);
        if (isNaN(num)) {
            return null;
        }
        return num;
    }

    public set walletIndex(walletIndex: number) {
        localStorage.setItem("WalletIndex", String(walletIndex));
    }

    public get password(): string {
        return localStorage.getItem("Password");;
    }

    public set password(password: string) {
        localStorage.setItem("Password", password);
    }

    public async loadSelectedMosaicData() {
        let selectedMosaic = await LcnemApi.loadSelectedMosaic(this.http, this.currentAccount);
        this.selectedMosaicData = this.mosaicData.filter(m => selectedMosaic.includes(m.namespace + ":" + m.name));
    }

    public async loadOwned() {
        let accountHttp = new AccountHttp(this.nodes);
        this.owned = await accountHttp.getMosaicOwnedByAddress(this.currentAccount.address).toPromise();
    }

    public async login() {
        let index = this.walletIndex;
        if (index == null) {
            return;
        }
        if(this.initialized) {
            return;
        }
        this.loadWallets();

        this.currentAccount = SimpleWallet.readFromWLT(this.wallets[index]).open(new Password(this.password));

        await this.loadMosaicData();
        await this.loadSelectedMosaicData();
        await this.loadOwned();

        this.initialized = true;
    }

    public logout() {
        this.walletIndex = null;
        this.password = null;
        this.currentAccount = null;
        this.initialized = false;
    }
}
