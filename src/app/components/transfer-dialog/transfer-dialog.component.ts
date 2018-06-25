import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { TransferTransaction, Mosaic, MosaicTransferable } from 'nem-library';
import { GlobalDataService } from '../../services/global-data.service';

@Component({
  selector: 'app-transfer-dialog',
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.css']
})
export class TransferDialogComponent {
    public transaction: TransferTransaction;
    public mosaics: MosaicTransferable[];
    public Math = Math;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, public global: GlobalDataService) {
        this.transaction = data.transaction as TransferTransaction;
        this.mosaics = data.mosaics;
    }

    public getMosaicName(m: MosaicTransferable) {
        return m.mosaicId.namespaceId + ":" + m.mosaicId.name;
    }

    public translation = {
        confirmation: {
            en: "Are you sure?",
            ja: "送信しますか？"
        },
        encryption: {
            en: "Encryption",
            ja: "暗号化"
        },
        expenses: {
            en: "Expenses",
            ja: "費用"
        },
        fees: {
            en: "Blockchain fees",
            ja: "ブロックチェーン手数料"
        },
        message: {
            en: "Message",
            ja: "メッセージ"
        },
        no: {
            en: "No",
            ja: "いいえ"
        },
        yes: {
            en: "Yes",
            ja: "はい"
        }
    } as {[key: string]: {[key: string]: string}};
}
