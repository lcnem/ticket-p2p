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

@Injectable()
export class GlobalDataService {
    private initialized = false;

    public lang = "en";

    public account?: Account;

    public accountHttp: AccountHttp;
    public mosaicHttp: MosaicHttp;
    public namespaceHttp: NamespaceHttp;
    public transactionHttp: TransactionHttp;
    public events = [] as {[key: string]: string}[];

    constructor(
        public auth: AngularFireAuth,
        public firestore: AngularFirestore,
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

        await this.refresh();

        this.initialized = true;
    }

    public async refresh() {
        let uid = this.auth.auth.currentUser!.uid;
        let docRef = this.firestore.collection("users").doc(uid).collection("events").ref;
        this.events = [];
        docRef.get().then(snapshot => {
            snapshot.forEach(doc => {
                this.events!.push({
                    id: doc.id,
                    name: doc.data().name
                })
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });

    }
}
