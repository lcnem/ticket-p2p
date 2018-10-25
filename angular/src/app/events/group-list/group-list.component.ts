import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { GlobalDataService } from '../../services/global-data.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  public dataSource?: MatTableDataSource<{
    name: string,
    capacity: number
  }>;
  public displayedColumns = ["groupName", "capacity"];

  @Input() groups!: {
    name: string,
    capacity: number
  }[];

  constructor(
    public global: GlobalDataService
  ) { }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.groups);
  }

  public translation = {
    groupName: {
      en: "Group name",
      ja: "グループ名"
    } as any,
    capacity: {
      en: "Capacity",
      ja: "定員"
    } as any
  };
}
