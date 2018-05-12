import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../../data/data.service';

@Component({
    selector: 'app-mosaic-tile',
    templateUrl: './mosaic-tile.component.html',
    styleUrls: ['./mosaic-tile.component.css']
})
export class MosaicTileComponent implements OnInit {
    @Input() public namespace: string | undefined;
    @Input() public name: string | undefined;

    constructor(public dataService: DataService) { }

    ngOnInit() {
    }

}
