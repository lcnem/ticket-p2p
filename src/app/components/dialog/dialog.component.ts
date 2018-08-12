import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string,
            content: string
            cancel: string,
            confirm: string
        }
    ) { }
}
