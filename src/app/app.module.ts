import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    MatDividerModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatListModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatCheckboxModule,
    MatTableModule
} from '@angular/material';

import { AppComponent } from './app.component';

import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';

import { HomeComponent} from './home/home.component';
import { LoginComponent } from './accounts/login/login.component';
import { PageNotFoundComponent } from './error/page-not-found/page-not-found.component';
import { LoadingDialogComponent } from './components/loading-dialog/loading-dialog.component';
import { GlobalDataService } from './services/global-data.service';
import { DialogComponent } from './components/dialog/dialog.component';
import { ScanComponent } from './events/scan/scan.component';
import { EventComponent } from './events/event/event.component';
import { InputDialogComponent } from './components/input-dialog/input-dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        ScanComponent,
        PageNotFoundComponent,
        LoadingDialogComponent,
        DialogComponent,
        EventComponent,
        InputDialogComponent
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
        MatProgressSpinnerModule,
        MatTabsModule,
        MatDividerModule,
        MatAutocompleteModule,
        MatDialogModule,
        MatListModule,
        MatSlideToggleModule,
        MatStepperModule,
        MatTableModule
    ],
    entryComponents: [
        LoadingDialogComponent,
        DialogComponent,
        InputDialogComponent
    ],
    providers: [GlobalDataService],
    bootstrap: [AppComponent]
})
export class AppModule { }
