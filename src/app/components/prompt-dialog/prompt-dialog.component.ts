import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatInput } from '@angular/material';

@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.css']
})
export class PromptDialogComponent {
  public model: any;

  @ViewChild('input')
  public input?: MatInput;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string,
      input: {
        maxlength: number,
        minlength: number,
        pattern: string,
        placeholder: string,
        value: any
      }
    }
  ) {
    this.model = data && data.input && data.input.value;
  }
}
