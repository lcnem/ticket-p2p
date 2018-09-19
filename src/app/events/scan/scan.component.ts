import { Component, OnInit, ViewChild } from '@angular/core';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalDataService } from '../../services/global-data.service';
import { HttpClient } from '@angular/common/http';
import { LoadingDialogComponent } from '../../components/loading-dialog/loading-dialog.component';
import { AlertDialogComponent } from '../../components/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.css']
})
export class ScanComponent implements OnInit {
  public userId?: string;
  public eventId?: string;
  public scanning = false;

  @ViewChild('scanner')
  scanner?: ZXingScannerComponent;

  noCamera = false;
  hasPermission = false;

  availableDevices?: MediaDeviceInfo[];
  selected?: number;

  constructor(
    public global: GlobalDataService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.userId = this.route.snapshot.queryParamMap.get('userId') || undefined;
    this.eventId = this.route.snapshot.paramMap.get('eventId') || undefined;

    if (!this.scanner) {
      return;
    }

    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      this.availableDevices = devices;
      this.selected = 0;
    });

    this.scanner.camerasNotFound.subscribe(() => {
      this.noCamera = true;
    });

    this.scanner.permissionResponse.subscribe((answer: boolean) => {
      this.hasPermission = answer;
    });

    this.scanner.scanSuccess.subscribe((result: any) => {
      console.log(result);
      let dialog = this.dialog.open(LoadingDialogComponent, { disableClose: true });

      this.http.post(
        "https://us-central1-ticket-p2p.cloudfunctions.net/checkTicket",
        {
          userId: this.userId,
          eventId: this.eventId,
          nemAddress: result
        }
      ).subscribe(
        (value) => {
          dialog.close();
          this.dialog.open(AlertDialogComponent, {
            data: {
              title: this.translation.completed[this.global.lang],
              content: ""
            }
          });
        },
        (error) => {
          dialog.close();
          this.dialog.open(AlertDialogComponent, {
            data: {
              title: this.translation.error[this.global.lang],
              content: this.translation.invalid[this.global.lang]
            }
          });
        }
      )
    });
  }

  public get selectedDevice() {
    if (this.selected === undefined) {
      return null;
    }
    if (this.availableDevices === undefined) {
      return null;
    }

    return this.availableDevices![this.selected!];
  }

  public translation = {
    noCamera: {
      en: "Cameras not found.",
      ja: "カメラが見つかりません。"
    },
    noPermission: {
      en: "Permissions required.",
      ja: "カメラ許可が必要です。"
    },
    scan: {
      en: "Scan QR-code",
      ja: "QRコードをスキャン"
    },
    selectCamera: {
      en: "Select camera",
      ja: "カメラを選択"
    },
    error: {
      en: "Error",
      ja: "エラー"
    },
    completed: {
      en: "Completed",
      ja: "完了"
    },
    invalid: {
      en: "This ticket is already used or invalid.",
      ja: "このチケットは既に使用されているか、無効なチケットです。"
    }
  } as { [key: string]: { [key: string]: string } };
}
