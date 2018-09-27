import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import * as firebase from 'firebase';
import 'firebase/auth'
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Event } from '../../models/event';
import { CapacitySupplement } from '../../models/capacityAddition';

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {
  private initialized = false;

  public lang = "en";

  public photoUrl = "";
  public eventIds?: Array<string>;
  public archivedEventIds?: Array<string>;
  public events?: { [key: string]: Event };

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private http: HttpClient
  ) {
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
    let eventsRef = this.firestore.collection("users").doc(uid).collection("events").ref;

    this.eventIds = [];
    this.archivedEventIds = [];
    this.events = {};

    let events = await eventsRef.get();

    events.forEach(event => {
      let data = event.data() as any as Event;
      if (data.archived) {
        this.archivedEventIds!.push(event.id);
      } else {
        this.eventIds!.push(event.id);
      }
      this.events![event.id] = data;
    });

    for (let key in this.events!) {
      let purchases = await this.firestore.collection("users").doc(uid).collection("events").doc(key).collection("purchases").ref.get();
 
      this.events![key].purchases = purchases.docs.length;

      let supplements = await this.firestore.collection("users").doc(uid).collection("events").doc(key).collection("capacitySupplements").ref.get();

      this.events![key].capacity = 0;
      supplements.forEach(supplement => {
        let data = supplement.data() as any as CapacitySupplement;
        this.events![key].capacity += Number(data.capacity);
      });

      this.events![key].available = this.events![key].capacity - this.events![key].purchases;
    }
  }
}
