import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../../data/data.service';

@Component({
    selector: 'app-mosaic-card',
    templateUrl: './mosaic-card.component.html',
    styleUrls: ['./mosaic-card.component.css']
})
export class MosaicCardComponent implements OnInit {
    @Input() public namespace: string | undefined;
    @Input() public name: string | undefined;
    public issuer: string | undefined;

    constructor(public dataService: DataService) {
        
    }

    ngOnInit() {
        this.issuer = this.dataService.getIssuer(this.namespace!, this.name!);
    }

}
