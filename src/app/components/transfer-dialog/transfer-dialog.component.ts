import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { TransferTransaction, MosaicTransferable } from 'nem-library';
import { DataService } from '../../data/data.service';

@Component({
    selector: 'app-transfer-dialog',
    templateUrl: './transfer-dialog.component.html',
    styleUrls: ['./transfer-dialog.component.css']
})
export class TransferDialogComponent {
    public transaction: TransferTransaction;
    public mosaics: MosaicTransferable[];

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dataService: DataService) {
        this.transaction = data.transaction as TransferTransaction;
        this.mosaics = data.mosaics as MosaicTransferable[];
    }
}
