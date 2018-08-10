import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { firebase } from '@firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import {
    Account,
    AccountHttp,
    MosaicHttp,
    NamespaceHttp,
    TransactionHttp,
    Password,
    SimpleWallet,
    Mosaic,
    NEMLibrary,
    MosaicDefinition,
    NetworkTypes,
    XEM,
    PublicAccount,
    NodeHttp,
    ServerConfig
} from 'nem-library';
import { nodes } from '../../models/nodes';
import { Event } from '../../models/event';

@Injectable()
export class GlobalDataService {
    private initialized = false;

    public lang = "en";

    public account?: Account;

    public accountHttp: AccountHttp;
    public mosaicHttp: MosaicHttp;
    public namespaceHttp: NamespaceHttp;
    public transactionHttp: TransactionHttp;

    public eventIds?: Array<string>;
    public events?: {[key: string]: Event};

    constructor(
        private auth: AngularFireAuth,
        private firestore: AngularFirestore,
        private http: HttpClient
    ) {
        NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
        const settings = { timestampsInSnapshots: true };
        firestore.firestore.settings(settings);

        this.accountHttp = new AccountHttp(nodes);
        this.mosaicHttp = new MosaicHttp(nodes);
        this.transactionHttp = new TransactionHttp(nodes);
        this.namespaceHttp = new NamespaceHttp(nodes);

        this.lang = window.navigator.language.substr(0, 2) == "ja" ? "ja" : "en";
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
        let docRef = this.firestore.collection("users").doc(uid).ref;
        let doc = await docRef.get();
        if (!doc.exists) {
            await docRef.set({});
        }
        this.refresh();

        this.initialized = true;
    }

    public async refresh() {
        let uid = this.auth.auth.currentUser!.uid;
        let docRef = this.firestore.collection("users").doc(uid).collection("events").ref;

        this.events = {};

        let doc = await docRef.get();
        doc.forEach(d => {
            this.events![d.id] = d.data() as any;
        });
        this.eventIds = Object.keys(this.events);
    }
}
