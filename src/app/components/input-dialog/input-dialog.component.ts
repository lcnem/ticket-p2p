import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-input-dialog',
    templateUrl: './input-dialog.component.html',
    styleUrls: ['./input-dialog.component.css']
})
export class InputDialogComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string,
            placeholder: string,
            inputData: string,
            inputType?: string,
            cancel: string,
            submit: string,
        }
    ) { }

    ngOnInit() {
    }

}
