import { Component, OnInit } from '@angular/core';
import { lang } from 'src/models/lang';
import { Group } from 'src/../../firebase/functions/src/models/group';

@Component({
  selector: 'app-group-dialog',
  templateUrl: './group-dialog.component.html',
  styleUrls: ['./group-dialog.component.css']
})
export class GroupDialogComponent implements OnInit {
  get lang() { return lang; };

  public groups: Group[] = [{} as any];

  constructor() { }

  ngOnInit() {
  }

  
  public addGroup(index: number) {
    if (index != this.groups.length - 1) {
      return;
    }
    this.groups.push({} as any);
  }

  public deleteGroup(index: number) {
    this.groups.splice(index, 1);
  }

  public translation = {
    error: {
      en: "Error",
      ja: "エラー"
    } as any,
    addGroups: {
      en: "Add group",
      ja: "枠の追加"
    } as any,
    groupName: {
      en: "Group name",
      ja: "グループ名"
    } as any,
    capacity: {
      en: "Capacity",
      ja: "定員"
    } as any,
    unsupported: {
      en: "Request Payment API is not supported in this browser.",
      ja: "Request Payment APIがこのブラウザではサポートされていません。"
    } as any,
    fee: {
      en: "Fee",
      ja: "手数料"
    } as any,
    tax: {
      en: "Consumption tax",
      ja: "消費税"
    } as any,
    total: {
      en: "Total",
      ja: "合計"
    } as any,
    completed: {
      en: "Completed",
      ja: "完了"
    } as any
  };
}
