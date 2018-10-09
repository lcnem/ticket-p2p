import { Component, OnInit } from '@angular/core';
import { GlobalDataService } from '../../services/global-data.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Event } from '../../../models/event';
import { Sale } from '../../../models/sale';
import { MatDialog } from '@angular/material';
import { AlertDialogComponent } from '../../components/alert-dialog/alert-dialog.component';
import * as firebase from 'firebase';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  public loading = true;
  public event!: {
    id: string,
    data: Event,
    sales: Sale[]
  };
  public name = "";
  public groups: {
    name: string,
    capacity: number
  }[] = [] as any;

  constructor(
    public global: GlobalDataService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
    this.auth.authState.subscribe(async (user) => {
      if (user == null) {
        this.router.navigate(["accounts", "login"]);
        return;
      }
      await this.global.initialize();
      await this.initialize();

      this.loading = false;
    });
  }

  public async initialize() {
    let id = this.route.snapshot.paramMap.get('id');
    let event = this.global.events.find(event => id == event.id);

    if (!event) {
      this.dialog.open(AlertDialogComponent, {
        data: {
          title: this.translation.error[this.global.lang],
          content: ""
        }
      }).afterClosed().subscribe(() => {
        this.router.navigate([""]);
      });
      return;
    }

    this.event = event;
    this.name = event.data.name;
    this.groups = []; // this.groups = gropus;
  }

  public async submit() {
    let uid = this.auth.auth.currentUser!.uid;

    await this.firestore.collection("users").doc(uid).collection("events").doc(this.event.id).set({
      name: this.name
    } as Event, { merge: true });

  }

  public async addGroup() {
    // ここでapiをたたいて枠の追加を行う

    const groups = { // モック
      name: "",
      capacity: 0
    }

    this.groups.push(groups)
    
  }

  public translation = {
    error: {
      en: "Error",
      ja: "エラー"
    } as any,
    editEvent: {
      en: "Edit an event",
      ja: "イベントを編集"
    } as any,
    eventName: {
      en: "Event name",
      ja: "イベント名"
    } as any,
    groupName: {
      en: "Group name",
      ja: "グループ名"
    } as any,
    capacity: {
      en: "Capacity",
      ja: "人数"
    } as any,
    submit: {
      en: "Submit",
      ja: "保存"
    } as any
  };
}
