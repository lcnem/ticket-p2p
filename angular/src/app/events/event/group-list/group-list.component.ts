import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { EventsService } from '../../../services/events.service';
import { lang } from '../../../../models/lang';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  public loading = true;
  get lang() { return lang; };

  public dataSource = new MatTableDataSource<{
    name: string,
    capacity: number
  }>();
  public displayedColumns = ["name", "capacity"];

  @Input() userId!: string;
  @Input() eventId!: string;

  constructor(
    private events: EventsService
  ) { }

  ngOnInit() {
    this.refresh();
  }

  public async refresh() {
    await this.events.readEventDetails(this.eventId);

    this.dataSource.data = this.events.details[this.eventId].groups.map(group => {
      return {
        name: group.name,
        capacity: group.capacity
      }
    });

    this.loading = false;
  }

  public translation = {
    groupName: {
      en: "Group name",
      ja: "グループ名"
    } as any,
    capacity: {
      en: "Capacity",
      ja: "定員"
    } as any,
    noGroups: {
      en: "There is no capacity group.",
      ja: "定員区分はありません。"
    } as any
  };
}
