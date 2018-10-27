import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { lang } from 'src/models/lang';
import { back } from 'src/models/back';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit {
  get lang() { return lang; };

  public safeSite: SafeResourceUrl;
  constructor(
    private router: Router,
    sanitizer: DomSanitizer
  ) {
    this.safeSite = sanitizer.bypassSecurityTrustResourceUrl(`assets/terms/privacy-policy/${this.lang}.txt`);
  }

  ngOnInit() {
  }
  
  public back() {
    back(() => this.router.navigate([""]));
  }

  public translation = {
    privacyPolicy: {
      en: "Privacy Policy",
      ja: "プライバシーポリシー"
    } as any
  };
}
