import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import {
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatRippleModule,
    MatChipsModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatStepperModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { PageNotFoundComponent } from './error/page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { TransferComponent } from './transfer/transfer.component';
import { MosaicComponent } from './mosaic/mosaic.component';
import { HomeComponent } from './home/home.component';

import { FlexLayoutModule } from "@angular/flex-layout";
import { DataService } from './data/data.service';
import { StreamingService } from "./streaming/streaming.service";
import { HistoryComponent } from './history/history.component';
import { FormsModule } from '@angular/forms';
import { TransactionComponent } from './history/transaction/transaction.component';
import { ScanComponent } from './scan/scan.component';

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'transfer', component: TransferComponent },
    { path: 'scan', component: ScanComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'mosaic/:namespace/:mosaic', component: MosaicComponent },
    { path: '**', component: PageNotFoundComponent },
];

@NgModule({
    declarations: [
        AppComponent,
        PageNotFoundComponent,
        LoginComponent,
        TransferComponent,
        MosaicComponent,
        HomeComponent,
        HistoryComponent,
        TransactionComponent,
        ScanComponent,
    ],
    imports: [
        BrowserModule,
        RouterModule.forRoot(appRoutes),
        FormsModule,
        BrowserAnimationsModule,
        ZXingScannerModule.forRoot(),
        MatButtonModule,
        MatCheckboxModule,
        MatToolbarModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatGridListModule,
        MatIconModule,
        MatTooltipModule,
        MatFormFieldModule,
        FlexLayoutModule,
        MatSidenavModule,
        MatRippleModule,
        HttpClientModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatStepperModule
    ],
    providers: [DataService, StreamingService],
    bootstrap: [AppComponent]
})
export class AppModule { }
