import { Component, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { Result } from '@zxing/library';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalDataService } from '../../services/global-data.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Address, TransactionTypes, TransferTransaction, PlainMessage } from 'nem-library';
import { HttpClient } from '@angular/common/http';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { LoadingDialogComponent } from '../../components/loading-dialog/loading-dialog.component';


@Component({
    selector: 'app-scan',
    templateUrl: './scan.component.html',
    styleUrls: ['./scan.component.css']
})
export class ScanComponent implements OnInit {
    public id?: string;

    @ViewChild('scanner')
    scanner?: ZXingScannerComponent;

    noCamera = false;
    hasPermission = false;

    availableDevices?: MediaDeviceInfo[];
    selected?: number;

    resultText?: string;

    constructor(
        public global: GlobalDataService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private auth: AngularFireAuth,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id') || undefined;

        this.auth.authState.subscribe(async (user) => {
            if (user == null) {
                this.router.navigate(["login"]);
                return;
            }
            await this.global.initialize();
            
            if (!this.scanner) {
                return;
            }

            this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
                this.availableDevices = devices;
                this.selected = 0;
            });

            this.scanner.camerasNotFound.subscribe(() => {
                this.noCamera = true;
            });

            this.scanner.permissionResponse.subscribe((answer: boolean) => {
                this.hasPermission = answer;
            });

            this.scanner.scanComplete.subscribe(this.onScanComplete);
        });
    }

    public isUndefined(value: any) {
        return value === undefined;
    }

    public async onScanComplete(result: any) {
        let dialog = this.dialog.open(LoadingDialogComponent);

        try {
            let address = new Address(result);

            let transactions = await this.global.accountHttp.allTransactions(address).toPromise();
            if(transactions.length == 1) {
                if(transactions[0].type == TransactionTypes.TRANSFER) {
                    if((transactions[0] as TransferTransaction).signer!.address.plain() == "") {
                        if(((transactions[0] as TransferTransaction).message as PlainMessage).plain() == this.id) {
                            await this.http.post(
                                "",
                                {
                                    nemAddress: result
                                }
                            ).toPromise();

                            this.dialog.open(DialogComponent, {
                                data: {
                                    title: this.translation.completed[this.global.lang],
                                    content: "",
                                    cancel: this.translation.cancel[this.global.lang],
                                    confirm: this.translation.confirm[this.global.lang]
                                }
                            });

                            return;
                        }
                    }
                }
            }
            
            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.error[this.global.lang],
                    content: this.translation.invalid[this.global.lang],
                    cancel: this.translation.cancel[this.global.lang],
                    confirm: this.translation.confirm[this.global.lang]
                }
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
        } finally {
            dialog.close();
        }
    }

    public translation = {
        noCamera: {
            en: "Cameras not found.",
            ja: "カメラが見つかりません。"
        },
        noPermission: {
            en: "Permissions required.",
            ja: "カメラ許可が必要です。"
        },
        scan: {
            en: "Scan QR-code",
            ja: "QRコードをスキャン"
        },
        selectCamera: {
            en: "Select camera",
            ja: "カメラを選択"
        },
        error: {
            en: "Error",
            ja: "エラー"
        },
        completed: {
            en: "Completed",
            ja: "完了"
        },
        invalid: {
            en: "This ticket is already used or invalid.",
            ja: "このチケットは既に使用されているか、無効なチケットです。"
        },
        cancel: {
            en: "Cancel",
            ja: "キャンセル"
        },
        confirm: {
            en: "Confirm",
            ja: "確認"
        }
    } as {[key: string]: {[key: string]: string}};
}
