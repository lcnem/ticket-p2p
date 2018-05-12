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
    ServerConfig,
    MosaicDefinition,
    TransactionHttp,
    MosaicHttp,
    MosaicId,
    XEM,
    NamespaceHttp
} from "nem-library";
import { LoginComponent } from '../login/login.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { firebase } from '@firebase/app';
import { Nodes } from '../../models/constants';

export class MosaicData {
    constructor(
        public namespace: string,
        public name: string,
        public unit: string | null,
        public issuer: string,
        public site: string
    ) { }
}
export class OwnedMosaic {
    constructor(
        public quantity: number,
        public definition: MosaicDefinition
    ) { }
}

@Injectable()
export class DataService {
    private initialized = false;

    public account: Account | undefined;

    public mosaicData: MosaicData[] | undefined;
    public ownedMosaics: OwnedMosaic[] | undefined;

    public accountHttp: AccountHttp;
    public mosaicHttp: MosaicHttp;
    public transactionHttp: TransactionHttp;
    public namespaceHttp: NamespaceHttp;

    constructor(private http: HttpClient, public auth: AngularFireAuth, public firestore: AngularFirestore) {
        NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);

        const settings = { timestampsInSnapshots: true };
        firestore.firestore.settings(settings);

        const node = [Nodes[Math.floor(Math.random() * Nodes.length)]];
        this.accountHttp = new AccountHttp(node);
        this.mosaicHttp = new MosaicHttp(node);
        this.transactionHttp = new TransactionHttp(node);
        this.namespaceHttp = new NamespaceHttp(node);
    }

    public async login() {
        await this.auth.auth.signInWithPopup(new firebase.auth!.GoogleAuthProvider);
    }

    public async logout() {
        await this.auth.auth.signOut();
        this.initialized = false;
    }

    public async initialize() {
        if (this.initialized) {
            return;
        }

        let uid = this.auth.auth.currentUser!.uid;
        let password = new Password(uid);

        let docRef = this.firestore.collection("users").doc(uid).ref;
        let doc = await docRef.get();
        if (!doc.exists) {
            await docRef.set({});
            doc = await docRef.get();
        }
        this.account = SimpleWallet.readFromWLT(doc.data()!["wallet"]).open(password);

        await this.refresh();

        this.initialized = true;
    }

    public async refresh() {
        this.mosaicData = await this.http.get<MosaicData[]>('https://lcnem.github.io/wallet/list.json').toPromise();

        let owned = await this.accountHttp.getMosaicOwnedByAddress(this.account!.address).toPromise();
        this.ownedMosaics = new Array<OwnedMosaic>();
        for (let i = 0; i < owned.length; i++) {
            let definition: MosaicDefinition;
            if (owned[i].mosaicId.namespaceId == "nem" && owned[i].mosaicId.name == "xem") {
                definition = {
                    creator: null!,
                    id: owned[i].mosaicId,
                    description: "",
                    properties: {
                        initialSupply: XEM.INITIALSUPPLY,
                        supplyMutable: XEM.SUPPLYMUTABLE,
                        transferable: XEM.TRANSFERABLE,
                        divisibility: XEM.DIVISIBILITY
                    }
                }
            } else {
                definition = await this.mosaicHttp.getMosaicDefinition(owned[i].mosaicId).toPromise();
            }
            this.ownedMosaics.push({
                quantity: owned[i].quantity,
                definition: definition
            });
        }
        this.ownedMosaics.sort((a, b) => {
            const nameA = a.definition.id.namespaceId + a.definition.id.name;
            const nameB = b.definition.id.namespaceId + b.definition.id.name;
            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
    }

    public getImageUrl(namespace: string, name: string): string {
        let data = this.mosaicData && this.mosaicData.find(m => m.namespace == namespace && m.name == name);
        if (!data) {
            return "https://lcnem.github.io/wallet/mosaic.svg";
        }
        return "https://lcnem.github.io/wallet/" + namespace + "/" + name + ".svg";
    }

    public getDefinition(namespace: string, name: string): MosaicDefinition | null {
        let data = this.ownedMosaics && this.ownedMosaics.find(m => m.definition.id.namespaceId == namespace && m.definition.id.name == name);
        if (!data) {
            return null;
        }
        return data.definition;
    }

    public getAmount(namespace: string, name: string): number {
        let data = this.ownedMosaics && this.ownedMosaics.find(m => m.definition!.id.namespaceId == namespace && m.definition!.id.name == name);
        if (data === undefined) {
            return 0;
        }
        return data.quantity / Math.pow(10, data.definition.properties.divisibility);
    }

    public getIssuer(namespace: string, name: string): string {
        let data = this.mosaicData && this.mosaicData.find(m => m.namespace == namespace && m.name == name);
        if (data) {
            return data.issuer;
        }
        return "@" + namespace;
    }

    public getUnit(namespace: string, name: string): string | null {
        let data = this.mosaicData && this.mosaicData.find(m => m.namespace == namespace && m.name == name);
        if (data) {
            return data.unit;
        }
        return null;
    }

    public getSite(namespace: string, name: string): string | null {
        let data = this.mosaicData && this.mosaicData.find(m => m.namespace == namespace && m.name == name);
        if (data) {
            return data.site;
        }
        return null;
    }
}
