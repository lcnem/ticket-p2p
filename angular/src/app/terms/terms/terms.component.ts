import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { lang } from 'src/models/lang';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {
  get lang() { return lang; };

  public safeSite: SafeResourceUrl;

  constructor(
    sanitizer: DomSanitizer
  ) {
    this.safeSite = sanitizer.bypassSecurityTrustResourceUrl(`assets/terms/terms/${this.lang}.txt`);
  }

  ngOnInit() {
  }

  public translation = {
    terms: {
      en: "Terms of Service",
      ja: "利用規約"
    } as any
  };
}
