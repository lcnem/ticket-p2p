import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './accounts/login/login.component';
import { SignComponent } from './accounts/sign/sign.component';
import { HistoryComponent } from './transactions/history/history.component';
import { ScanComponent } from './transactions/scan/scan.component';
import { TransferComponent } from './transactions/transfer/transfer.component';
import { PageNotFoundComponent } from './error/page-not-found/page-not-found.component';
import { WithdrawComponent } from './accounts/withdraw/withdraw.component';
import { DepositComponent } from './accounts/deposit/deposit.component';

const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "accounts/login", component: LoginComponent},
    {path: "accounts/deposit", component: DepositComponent},
    {path: "accounts/withdraw", component: WithdrawComponent},
    {path: "accounts/sign", component: SignComponent},
    {path: "transactions/history", component: HistoryComponent},
    {path: "transactions/scan", component: ScanComponent},
    {path: "transactions/transfer", component: TransferComponent},
    {path: "**", component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
