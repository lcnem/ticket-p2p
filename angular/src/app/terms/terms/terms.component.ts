import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { lang } from 'src/models/lang';
import { back } from 'src/models/back';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {
  get lang() { return lang; };

  public safeSite: SafeResourceUrl;

  constructor(
    private router: Router,
    sanitizer: DomSanitizer
  ) {
    this.safeSite = sanitizer.bypassSecurityTrustResourceUrl(`assets/terms/terms/${this.lang}.txt`);
  }

  ngOnInit() {
  }

  public back() {
    back(() => this.router.navigate([""]));
  }

  public translation = {
    terms: {
      en: "Terms of Service",
      ja: "利用規約"
    } as any
  };
}
