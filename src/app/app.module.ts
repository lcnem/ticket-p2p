import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from "@angular/flex-layout";
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
  MatProgressSpinnerModule,
  MatDividerModule,
  MatDialogModule,
  MatListModule,
  MatSlideToggleModule,
  MatCheckboxModule,
  MatMenuModule,
  MatTableModule,
  MatPaginatorModule
} from '@angular/material';

import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './accounts/login/login.component';
import { PageNotFoundComponent } from './error/page-not-found/page-not-found.component';
import { EventComponent } from './events/event/event.component';
import { ScanComponent } from './events/scan/scan.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LoadingDialogComponent } from './components/loading-dialog/loading-dialog.component';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    PageNotFoundComponent,
    EventComponent,
    ScanComponent,
    AlertDialogComponent,
    ConfirmDialogComponent,
    LoadingDialogComponent,
    PromptDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    FlexLayoutModule,
    ZXingScannerModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatRippleModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
    MatListModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRippleModule
  ],
  entryComponents: [
    AlertDialogComponent,
    ConfirmDialogComponent,
    LoadingDialogComponent,
    PromptDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
