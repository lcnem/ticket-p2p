import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Password, SimpleWallet } from 'nem-library';

import { Group } from '../../../../firebase/functions/src/models/group';
import { Sale } from '../../../../firebase/functions/src/models/sale';
import { Event } from '../../../../firebase/functions/src/models/event';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  public events?: {
    [id: string]: Event
  };

  public details: {
    [id: string]: {
      groups: Group[],
      capacity: number
      sales: Sale[]
    }
  } = {};

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }

  public initialize() {
    this.events = undefined;
    this.details = {};
  }

  public async readEvents(force?: boolean) {
    if(!force && this.events) {
      return;
    }
    this.events = {};

    let uid = this.auth.auth.currentUser!.uid;
    let events = await this.firestore.collection("users").doc(uid).collection("events").ref.get();
    for(let event of events.docs) {
      this.events[event.id] = event.data() as Event;
    }
  }

  public async readEventDetails(id: string, force?: boolean) {
    if(!force && this.details[id]) {
      return;
    }

    let uid = this.auth.auth.currentUser!.uid;
    let eventRef = this.firestore.collection("users").doc(uid).collection("events").doc(id).ref;

    let groups = await eventRef.collection("groups").get();
    let groupsData = groups.docs.map(doc => doc.data() as Group);

    let capacity = 0;
    for (let group of groupsData) {
      capacity += group.capacity;
    }
    let sales = await eventRef.collection("sales").get();
    
    this.details[id] = {
      groups: groupsData,
      capacity: capacity,
      sales: sales.docs.map(doc => doc.data() as Sale)
    }
  }

  public async createEvent(name: string) {
    if(!this.events) {
      this.events = {};
    }
    let uid = this.auth.auth.currentUser!.uid;

    let password = new Password(uid);
    let privateKey = SimpleWallet.create(uid, password).open(password).privateKey;

    let data: Event = {
      name: name,
      privateKey: privateKey
    };

    let newEvent = await this.firestore.collection("users").doc(uid).collection("events").add(data);

    this.events[newEvent.id] = data;

    return newEvent;
  }

  public async updateEvent(id: string, data: any) {
    if(!this.events) {
      return;
    }
    let uid = this.auth.auth.currentUser!.uid;

    await this.firestore.collection("users").doc(uid).collection("events").doc(id).set(
      data,
      { merge: true }
    );

    this.events[id] = data;
  } 

  public async deleteEvent(id: string) {
    if(!this.events) {
      return;
    }
    let uid = this.auth.auth.currentUser!.uid;
    await this.firestore.collection("users").doc(uid).collection("events").doc(id).delete();

    delete this.events[id];
    delete this.details[id];
  }
}
