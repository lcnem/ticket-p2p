import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './error/page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { TransferComponent } from './transfer/transfer.component';
import { MosaicComponent } from './mosaic/mosaic.component';
import { HomeComponent } from './home/home.component';
import { HistoryComponent } from './history/history.component';
import { TransactionComponent } from './history/transaction/transaction.component';
import { ScanComponent } from './scan/scan.component';
import { ExchangeComponent } from './exchange/exchange.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'transfer', component: TransferComponent },
    { path: 'scan', component: ScanComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'mosaic/:namespace/:mosaic', component: MosaicComponent },
    { path: 'exchange', component: ExchangeComponent},
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
