import { Component, OnInit, ViewChild } from '@angular/core';
import { GlobalDataService } from '../../services/global-data.service';
import { MatDialog, MatStepper } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Invoice } from '../../../models/invoice';
import {
    Address,
    PublicAccount,
    PlainMessage,
    EncryptedMessage,
    Message,
    TransferTransaction,
    Mosaic,
    MosaicId,
    MosaicDefinition,
    TimeWindow,
    MosaicTransferable,
    XEM
} from 'nem-library';
import { LoadingDialogComponent } from '../../components/loading-dialog/loading-dialog.component';
import { DialogComponent } from '../../components/dialog/dialog.component';
import { TransferDialogComponent } from '../../components/transfer-dialog/transfer-dialog.component';

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html',
    styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
    @ViewChild('stepper')
    stepper?: MatStepper;

    public loading = true;

    public recipient = "";
    public message = "";
    public encrypt = false;

    public transferMosaics: { name: string, amount?: number }[] = [];

    constructor(
        public global: GlobalDataService,
        public dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.global.auth.authState.subscribe((user) => {
            if (user == null) {
                this.router.navigate(["/accounts/login"]);
                return;
            }
            this.global.initialize().then(() => {
                let json = this.route.snapshot.queryParamMap.get('invoice') || undefined;
                let invoice = Invoice.read(json);
                if (invoice) {
                    this.recipient = invoice.data.addr;
                    this.message = invoice.data.msg;
                }

                this.transferMosaics = this.global.mosaics!.map(m => {
                    return { name: m.mosaicId.namespaceId + ":" + m.mosaicId.name }
                });

                this.loading = false;
            });
        });
    }

    public async resolveNamespace() {
        let dialogRef = this.dialog.open(LoadingDialogComponent, { disableClose: true });
        try {
            let result = await this.global.namespaceHttp.getNamespace(this.recipient).toPromise();
            this.recipient = result.owner.pretty();
        } catch {
            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.error[this.global.lang],
                    content: this.translation.invalidNamespace[this.global.lang]
                }
            });
            return;
        } finally {
            dialogRef.close();
        }
    }

    public async transfer() {
        let address: Address;
        try {
            address = new Address(this.recipient!);
        } catch {
            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.error[this.global.lang],
                    content: this.translation.addressRequired[this.global.lang]
                }
            });
            return;
        }

        let message: Message;
        if (this.encrypt) {
            try {
                let meta = await this.global.accountHttp.getFromAddress(address).toPromise();
                message = this.global.account!.encryptMessage(this.message, meta.publicAccount);
            } catch {
                this.dialog.open(DialogComponent, {
                    data: {
                        title: this.translation.error[this.global.lang],
                        content: this.translation.noPublicKey[this.global.lang]
                    }
                });
                return;
            }
        } else {
            message = PlainMessage.create(this.message);
        }

        let transferMosaics: MosaicTransferable[] = [];
        for(let i = 0; i < this.transferMosaics.length; i++) {
            let m = this.transferMosaics[i];
            if(m.amount === undefined) {
                continue;
            }
            if (m.name == "nem:xem") {
                transferMosaics.push(new XEM(m.amount));
            } else {
                transferMosaics.push(MosaicTransferable.createWithMosaicDefinition(this.global.definitions![m.name], m.amount));
            }
        };
        if(!transferMosaics.length) {
            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.error[this.global.lang],
                    content: this.translation.noInput[this.global.lang]
                }
            });
            return;
        }

        let transaction = TransferTransaction.createWithMosaics(
            TimeWindow.createWithDeadline(),
            address,
            transferMosaics,
            message
        );

        let dialogRef = this.dialog.open(TransferDialogComponent, {
            data: {
                transaction: transaction,
                mosaics: transferMosaics
            }
        });

        dialogRef.afterClosed().subscribe(async result => {
            if (!result) {
                return;
            }
            let _dialogRef = this.dialog.open(LoadingDialogComponent, { disableClose: true });

            let signed = this.global.account!.signTransaction(transaction);
            try {
                await this.global.transactionHttp.announceTransaction(signed).toPromise();
            } catch {
                this.dialog.open(DialogComponent, {
                    data: {
                        title: this.translation.error[this.global.lang],
                        content: ""
                    }
                });
                return;
            } finally {
                _dialogRef.close();
            }

            this.dialog.open(DialogComponent, {
                data: {
                    title: this.translation.completed[this.global.lang],
                    content: ""
                }
            }).afterClosed().subscribe(() => {
                this.router.navigate(["/"]);
            })
        });
    }

    public translation = {
        address: {
            en: "NEM address",
            ja: "NEMアドレス"
        },
        addressRequired: {
            en: "An address is required.",
            ja: "アドレスを入力してください。"
        },
        amount: {
            en: "Amounts",
            ja: "量"
        },
        balance: {
            en: "Balance",
            ja: "残高"
        },
        encryption: {
            en: "Encryption",
            ja: "暗号化"
        },
        error: {
            en: "Error",
            ja: "エラー"
        },
        completed: {
            en: "Completed",
            ja: "完了"
        },
        fees: {
            en: "Fees",
            ja: "手数料"
        },
        inputEmpty: {
            en: "If not sending, leave the input empty.",
            ja: "送信しない場合、入力を空にします。"
        },
        invalidNamespace: {
            en: "Failed to resolve the namespace.",
            ja: "ネームスペース解決に失敗しました。"
        },
        message: {
            en: "Message",
            ja: "メッセージ"
        },
        mosaics: {
            en: "Tokens",
            ja: "トークン"
        },
        name: {
            en: "Name",
            ja: "名前"
        },
        namespace: {
            en: "NEM namespace",
            ja: "NEMネームスペース"
        },
        noInput: {
            en: "The amount of token has not been entered.",
            ja: "トークンの量が入力されていません。"
        },
        noPublicKey: {
            en: "Failed to get the recipient public key for encryption.",
            ja: "暗号化のための宛先の公開鍵取得に失敗しました。"
        },
        recipient: {
            en: "Recipient",
            ja: "宛先"
        },
        submit: {
            en: "Submit",
            ja: "送信"
        },
        transfer: {
            en: "Transfer",
            ja: "送信"
        }
    } as {[key: string]: {[key: string]: string}};
}
