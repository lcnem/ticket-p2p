import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { GlobalDataService } from '../../services/global-data.service';
import { MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-archived',
  templateUrl: './archived.component.html',
  styleUrls: ['./archived.component.css']
})
export class ArchivedComponent implements OnInit {
  public loading = true;

  constructor(
    public global: GlobalDataService,
    private router: Router,
    private dialog: MatDialog,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
  }

  ngOnInit() {
    this.auth.authState.subscribe(async (user) => {
      if (user == null) {
        this.router.navigate(["accounts", "login"]);
        return;
      }
      await this.global.initialize();

      this.loading = false;
    });
  }

  public async refresh() {
    this.loading = true;

    this.global.refresh();

    this.loading = false;
  }

  public async unarchiveEvent(eventId: string) {
    let uid = this.auth.auth.currentUser!.uid;

    await this.firestore.collection("users").doc(uid).collection("events").doc(eventId).set({
      archived: false
    }, { merge: true });

    await this.refresh();
  }

  public translation = {
    archived: {
      en: "Archived",
      ja: "アーカイブ"
    },
    empty: {
      en: "There is no archived event.",
      ja: "アーカイブされたイベントはありません。"
    }
  } as { [key: string]: { [key: string]: string } };
}
