import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { GlobalDataService } from '../../services/global-data.service';
import { MatDialog } from '@angular/material';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { HttpClient } from '@angular/common/http';
import { InputDialogComponent } from '../../components/input-dialog/input-dialog.component';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

declare let Stripe: any;

const stripePublicKey =
    //"";
    "pk_test_sVIc8W1jrazk2t1LxqAdnls3";

@Component({
    selector: 'app-event',
    templateUrl: './event.component.html',
    styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
    public loading = true;
    public id?: string;
    public eventName?: string;
    public purchased?: number;
    public capacity?: number;
    public postUrl = "https://us-central1-ticket-p2p.cloudfunctions.net/createTicket/";
    public postParameters?: string;

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
        this.id = this.route.snapshot.paramMap.get('id') || undefined;

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
        let event = this.global.events![this.id!];

        if (!event || event.archived) {
            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.error[this.global.lang],
                    content: "",
                    cancel: this.translation.cancel[this.global.lang],
                    confirm: this.translation.confirm[this.global.lang]
                }
            }).afterClosed().subscribe(() => {
                this.router.navigate([""]);
            });
        }

        this.eventName = event.name;
        let nonce = event.nonce;

        this.purchased = event.purchases;
        this.capacity = event.capacity;

        this.postParameters = JSON.stringify({
            userId: this.auth.auth.currentUser!.uid,
            eventId: this.id,
            nonce: nonce,
            amount: 1
        }, null, 2);
    }

    public async refresh() {
        this.loading = true;

        await this.global.refresh();
        await this.initialize();

        this.loading = false;
    }

    public async editEventName() {
        this.dialog.open(InputDialogComponent, {
            data: {
                title: this.translation.edit[this.global.lang],
                placeholder: this.translation.eventName[this.global.lang],
                inputData: this.eventName,
                cancel: this.translation.cancel[this.global.lang],
                submit: this.translation.submit[this.global.lang]
            }
        }).afterClosed().subscribe(async (result) => {
            if (this.eventName == result) {
                return;
            }

            let uid = this.auth.auth.currentUser!.uid;

            await this.firestore.collection("users").doc(uid).collection("events").doc(this.id!).set({
                name: result
            }, { merge: true });

            await this.refresh();
        });
    }

    public async capacitySupplement() {
        this.dialog.open(InputDialogComponent, {
            data: {
                title: this.translation.supplement[this.global.lang],
                placeholder: this.translation.supplement[this.global.lang],
                inputData: 0,
                inputType: "number",
                cancel: this.translation.cancel[this.global.lang],
                submit: this.translation.submit[this.global.lang]
            }
        }).afterClosed().subscribe(async (result) => {
            if (result <= 0) {
                this.dialog.open(DialogComponent, {
                    data: {
                        title: this.translation.error[this.global.lang],
                        content: "",
                        cancel: this.translation.cancel[this.global.lang],
                        confirm: this.translation.confirm[this.global.lang]
                    }
                });
                return;
            }

            await this.chargeCreditCard(result);
        });
    }

    public async chargeCreditCard(capacity: number) {
        if (!(window as any).PaymentRequest) {
            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.error[this.global.lang],
                    content: "",
                    cancel: this.translation.cancel[this.global.lang],
                    confirm: this.translation.confirm[this.global.lang]
                }
            });
            return;
        }
        let supportedInstruments: PaymentMethodData[] = [{
            supportedMethods: ['basic-card'],
            data: {
                supportedNetworks: [
                    'visa',
                    'mastercard',
                    'amex',
                    'diners',
                    'jcb'
                ]
            }
        }];

        let details = {
            displayItems: [
                {
                    label: `${this.translation.fee[this.global.lang]}: 50x ${capacity}`,
                    amount: {
                        currency: "JPY",
                        value: (capacity * 50).toString()
                    }
                },
                {
                    label: `${this.translation.tax[this.global.lang]}: 4x ${capacity}`,
                    amount: {
                        currency: "JPY",
                        value: (capacity * 4).toString()
                    }
                }
            ],
            total: {
                label: this.translation.total[this.global.lang],
                amount: {
                    currency: "JPY",
                    value: (capacity * 54).toString()
                }
            }
        };

        let request = new PaymentRequest(supportedInstruments, details, { requestShipping: false });

        let result = await request.show();
        if (!result) {
            return;
        }

        Stripe.setPublishableKey(stripePublicKey);
        Stripe.card.createToken({
            number: result.details.cardNumber,
            cvc: result.details.cardSecurityCode,
            exp_month: result.details.expiryMonth,
            exp_year: result.details.expiryYear
        }, async (status: any, response: any) => {
            if (response.error) {
                result.complete("fail");

                return;
            }
            
            try {
                await this.http.post(
                    "https://us-central1-ticket-p2p.cloudfunctions.net/capacitySupplement",
                    {
                        userId: this.auth.auth.currentUser!.uid,
                        eventId: this.id,
                        capacity: capacity,
                        token: response.id
                    }
                ).toPromise();

                result.complete("success");

                this.dialog.open(DialogComponent, {
                    data: {
                        title: this.translation.completed[this.global.lang],
                        content: "",
                        cancel: this.translation.cancel[this.global.lang],
                        confirm: this.translation.confirm[this.global.lang]
                    }
                }).afterClosed().subscribe(async () => {
                    await this.refresh();
                });
            } catch {
                this.dialog.open(DialogComponent, {
                    data: {
                        title: this.translation.error[this.global.lang],
                        content: "",
                        cancel: this.translation.cancel[this.global.lang],
                        confirm: this.translation.confirm[this.global.lang]
                    }
                });
                
                result.complete("fail");
            }
        });
    }

    public translation = {
        amount: {
            en: "Amount",
            ja: "金額"
        },
        error: {
            en: "Error",
            ja: "エラー"
        },
        completed: {
            en: "Completed",
            ja: "完了"
        },
        unsupported: {
            en: "Request Payment API is not supported in this browser.",
            ja: "Request Payment APIがこのブラウザではサポートされていません。"
        },
        fee: {
            en: "Fee",
            ja: "手数料"
        },
        tax: {
            en: "Consumption tax",
            ja: "消費税"
        },
        total: {
            en: "Total",
            ja: "合計"
        },
        eventId: {
            en: "Event ID",
            ja: "イベントID"
        },
        eventName: {
            en: "Event name",
            ja: "イベント名"
        },
        edit: {
            en: "Edit",
            ja: "編集"
        },
        capacity: {
            en: "Capacity",
            ja: "定員"
        },
        supplement: {
            en: "Supplement",
            ja: "枠追加"
        },
        cancel: {
            en: "Cancel",
            ja: "キャンセル"
        },
        confirm: {
            en: "Confirm",
            ja: "確認"
        },
        submit: {
            en: "Submit",
            ja: "決定"
        },
        postUrl: {
            en: "POST URL",
            ja: "POST URL"
        },
        postParameters: {
            en: "POST Parameters",
            ja: "POST パラメータ"
        }
    } as { [key: string]: { [key: string]: string } };
}
