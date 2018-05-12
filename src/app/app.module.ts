import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import {
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatRippleModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatListModule,
    MatSlideToggleModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule } from '@angular/forms';

import { DataService } from './data/data.service';

import { PageNotFoundComponent } from './error/page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { TransferComponent } from './transfer/transfer.component';
import { MosaicComponent } from './mosaic/mosaic.component';
import { HomeComponent } from './home/home.component';
import { HistoryComponent } from './history/history.component';
import { TransactionComponent } from './history/transaction/transaction.component';
import { ScanComponent } from './scan/scan.component';

import { AppRoutingModule } from './app-routing.module';

import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import { ExchangeComponent } from './exchange/exchange.component';
import { TransferDialogComponent } from './components/transfer-dialog/transfer-dialog.component';
import { MosaicTileComponent } from './components/mosaic-tile/mosaic-tile.component';
import { MosaicCardComponent } from './components/mosaic-card/mosaic-card.component';
import { LoadingDialogComponent } from './components/loading-dialog/loading-dialog.component';

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
        ExchangeComponent,
        TransferDialogComponent,
        MosaicTileComponent,
        MosaicCardComponent,
        LoadingDialogComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        BrowserAnimationsModule,
        ZXingScannerModule.forRoot(),
        ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireAuthModule,
        MatButtonModule,
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
        MatProgressSpinnerModule,
        MatTabsModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatDividerModule,
        MatAutocompleteModule,
        MatDialogModule,
        MatListModule,
        MatSlideToggleModule
    ],
    entryComponents: [
        TransferDialogComponent,
        LoadingDialogComponent
    ],
    providers: [DataService],
    bootstrap: [AppComponent]
})
export class AppModule { }
