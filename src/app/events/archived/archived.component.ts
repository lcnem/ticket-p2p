import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { GlobalDataService } from '../../services/global-data.service';
import { MatDialog } from '@angular/material';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { LoadingDialogComponent } from '../../components/loading-dialog/loading-dialog.component';
import { HttpClient } from '@angular/common/http';
import { InputDialogComponent } from '../../components/input-dialog/input-dialog.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

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
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private http: HttpClient,
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
