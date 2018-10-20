import { Component, OnInit } from '@angular/core';
import { GlobalDataService } from '../../services/global-data.service';
import { Router } from '@angular/router';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loading = true;
  public agree = false;
  public safeSite: SafeResourceUrl;

  constructor(
    public global: GlobalDataService,
    public router: Router,
    private auth: AngularFireAuth,
    sanitizer: DomSanitizer
  ) {
    this.safeSite = sanitizer.bypassSecurityTrustResourceUrl(`assets/terms/terms/${global.lang}.txt`);
  }

  ngOnInit() {
    this.auth.authState.subscribe((user) => {
      console.log(JSON.stringify(user));
      if (user) {
        this.router.navigate(["/"]);
        return;
      }
      this.loading = false;
    });
  }

  public async login() {
    await this.global.login();
    this.router.navigate(["/"]);
  }

  public translation = {
    agree: {
      en: "I agree.",
      ja: "同意します"
    } as any,
    login: {
      en: "Log in",
      ja: "ログイン"
    } as any
  };
}
