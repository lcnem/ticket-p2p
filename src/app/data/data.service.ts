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
import { MosaicData, LcnemApi } from '../models/api'

@Injectable()
export class DataService {
    public initialized = false;

    public wallets: string[];

    public mosaicData: MosaicData[];

    public currentAccount: Account;
    public ownedMosaicData: MosaicData[];
    public owned: Mosaic[];

    public nodes: ServerConfig[] = [
        {
            protocol: "https",
            domain: "aqualife1.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "aqualife2.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "aqualife3.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "beny.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "happy.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "mnbhsgwbeta.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "mnbhsgwgamma.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "nemstrunk.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "nemstrunk2.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "nsm.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "kohkei.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "mttsukuba.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "pegatennnag.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "qora01.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "shibuya.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "strategic-trader-1.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "strategic-trader-2.supernode.me",
            port: 7891
        },
        {
            protocol: "https",
            domain: "thomas1.supernode.me.supernode.me",
            port: 7891
        },
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

    public async loadOwned() {
        let accountHttp = new AccountHttp(this.nodes);
        this.owned = await accountHttp.getMosaicOwnedByAddress(this.currentAccount.address).toPromise();

        this.ownedMosaicData = this.mosaicData.filter(m => this.owned.find(o => o.mosaicId.namespaceId == m.namespace && o.mosaicId.name == m.name));
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
