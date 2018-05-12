import { Component, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { Result } from '@zxing/library';
import { MatSnackBar } from '@angular/material';
import { Invoice } from '../../models/invoice';
import { Router } from '@angular/router';
import { DataService } from '../data/data.service';

@Component({
    selector: 'app-scan',
    templateUrl: './scan.component.html',
    styleUrls: ['./scan.component.css']
})
export class ScanComponent implements OnInit {
    @ViewChild('scanner')
    scanner: ZXingScannerComponent | undefined;
    hasCameras = false;
    hasPermission = false;

    availableDevices: MediaDeviceInfo[] | undefined;
    selected: number | undefined;

    constructor(public snackBar: MatSnackBar, private router: Router, private dataService: DataService) { }

    ngOnInit() {
        this.dataService.auth.authState.subscribe((user) => {
            if (user == null) {
                this.router.navigate(["/login"]);
                return;
            }
            this.dataService.initialize().then(() => {
                if(!this.scanner) {
                    return;
                }
                this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
                    this.hasCameras = true;
    
                    this.availableDevices = devices;
                    this.selected = devices.length - 1;
                });
    
                this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) => {
                    this.snackBar.open("Camera not found", "", { duration: 2000 });
                });
    
                this.scanner.permissionResponse.subscribe((answer: boolean) => {
                    this.hasPermission = answer;
                    if (!answer) {
                        this.snackBar.open("Permission denied", "", { duration: 2000 });
                    }
                });
    
                this.scanner.scanComplete.subscribe((result: Result) => {
                    const json = result.getText();
                    let invoice = Invoice.read(json);
                    if (invoice == null) {
                        this.snackBar.open("Invalid QR-code", "", { duration: 2000 });
                        return;
                    }
                    this.router.navigate(["/transfer"], { queryParams: { json: json } });
                });
            });
        });
    }

    public isUndefined(value: any) {
        return value === undefined;
    }
}
