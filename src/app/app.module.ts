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

import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from '@angular/forms';

import { DataService } from './data/data.service';
import { StreamingService } from "./streaming/streaming.service";

import { PageNotFoundComponent } from './error/page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { TransferComponent } from './transfer/transfer.component';
import { MosaicComponent } from './mosaic/mosaic.component';
import { HomeComponent } from './home/home.component';
import { HistoryComponent } from './history/history.component';
import { TransactionComponent } from './history/transaction/transaction.component';
import { ScanComponent } from './scan/scan.component';

import { AppRoutingModule } from './app-routing.module';

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
        ScanComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        ZXingScannerModule.forRoot(),
        MatButtonModule,
        MatCheckboxModule,
        MatToolbarModule,
        MatCardModule,
        MatInputModule,
        MatSelectModule,
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
