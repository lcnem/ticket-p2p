import { Component, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { MatSnackBar } from '@angular/material';
import { Invoice } from '../models/invoice';
import { Router } from '@angular/router';
import { DataService } from '../data/data.service';

@Component({
    selector: 'app-scan',
    templateUrl: './scan.component.html',
    styleUrls: ['./scan.component.css']
})
export class ScanComponent implements OnInit {
    @ViewChild('scanner')
    scanner: ZXingScannerComponent;
    hasCameras = false;
    hasPermission: boolean;
    qrResultString: string;

    availableDevices: MediaDeviceInfo[];
    selectedDevice: MediaDeviceInfo;

    constructor(public snackBar: MatSnackBar, private router: Router, private dataService: DataService) { }

    ngOnInit() {
        if (this.dataService.walletIndex == null) {
            this.router.navigate(["/login"]);
            return;
        }
        this.dataService.login().then(() => {
            this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
                this.hasCameras = true;

                this.availableDevices = devices;
            });

            this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) => {
                this.snackBar.open("カメラが見つかりません。", "", { duration: 2000 });
            });

            this.scanner.permissionResponse.subscribe((answer: boolean) => {
                this.hasPermission = answer;
                if (!answer) {
                    this.snackBar.open("許可がないため使用できません。", "", { duration: 2000 });
                }
            });
        });
    }

    public handleQrCodeResult(resultString: string) {
        let invoice = Invoice.read(resultString);
        if (invoice == null) {
            this.snackBar.open("有効な専用QRコードではありません。", "", { duration: 2000 });
            return;
        }
        this.router.navigate(["/transfer"], { queryParams: { json: resultString } });
    }

    onDeviceSelectChange(selectedValue: string) {
        this.selectedDevice = this.scanner.getDeviceById(selectedValue);
    }
}
