import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import * as firebase from 'firebase';
import 'firebase/auth'
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Event } from '../../models/event';
import { Purchase } from '../../models/purchase';
import { NEMLibrary, NetworkTypes } from 'nem-library';

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {
  private initialized = false;

  public lang = "en";

  public photoUrl = "";
  public events: {
    id: string,
    data: Event,
    purchases: Purchase[]
  }[] = [];

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {
    NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
    const settings = { timestampsInSnapshots: true };
    firestore.firestore.settings(settings);

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
    this.photoUrl = this.auth.auth.currentUser!.photoURL!;

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
    let events = await this.firestore.collection("users").doc(uid).collection("events").ref.get();

    this.events = [];
    for(let doc of events.docs) {
      let purchases = await doc.ref.collection("purchases").get();

      this.events.push({
        id: doc.id,
        data: doc.data() as Event,
        purchases: purchases.docs.map(doc => doc.data() as Purchase)
      });
    }
  }
}
