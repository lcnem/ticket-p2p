import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Event } from '../../models/event';
import { Sale } from '../../models/sale';
import { NEMLibrary, NetworkTypes } from 'nem-library';
import { Router } from '@angular/router';
import { Group } from 'src/models/group';

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {
  private refreshed = false;
  private eventsRefreshed = false;

  public lang = "en";

  public photoUrl = "";
  public events: {
    id: string,
    data: Event,
    groups: Group[],
    sales: Sale[],
    capacity: number
  }[] = [];

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    NEMLibrary.bootstrap(NetworkTypes.MAIN_NET);
    const settings = { timestampsInSnapshots: true };
    firestore.firestore.settings(settings);

    this.lang = window.navigator.language.substr(0, 2) == "ja" ? "ja" : "en";
  }

  public back() {
    if (history.length > 1) {
      history.back();
      return;
    }
    this.router.navigate([""]);
  }

  public async refresh(force?: boolean) {
    if(this.refreshed && !force) {
      return;
    }

    this.photoUrl = this.auth.auth.currentUser!.photoURL!;

    let uid = this.auth.auth.currentUser!.uid;
    let docRef = this.firestore.collection("users").doc(uid).ref;
    let doc = await docRef.get();
    if (!doc.exists) {
      await docRef.set({});
    }

    this.refreshed = true;
  }

  public async refreshEvents(force?: boolean) {
    await this.refresh();

    if(this.eventsRefreshed && !force) {
      return;
    }

    let uid = this.auth.auth.currentUser!.uid;
    let events = await this.firestore.collection("users").doc(uid).collection("events").ref.get();

    this.events = [];
    for (let i = 0; i < events.docs.length; i++) {
      let doc = events.docs[i]
      let groups = await doc.ref.collection("groups").get();
      let groupsData = groups.docs.map(doc => doc.data() as Group);
      let sales = await doc.ref.collection("sales").get();
      let capacity = 0;
      for (let group of groupsData) {
        capacity += group.capacity;
      }

      this.events.push({
        id: doc.id,
        data: doc.data() as Event,
        groups: groupsData,
        sales: sales.docs.map(doc => doc.data() as Sale),
        capacity: capacity
      });
    }
  }
}
