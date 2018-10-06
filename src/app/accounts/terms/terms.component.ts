import { Component, OnInit } from '@angular/core';
import { GlobalDataService } from '../../services/global-data.service';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css']
})
export class TermsComponent implements OnInit {
  public safeSite: SafeResourceUrl;

  constructor(
    public global: GlobalDataService,
    sanitizer: DomSanitizer
  ) {
    this.safeSite = sanitizer.bypassSecurityTrustResourceUrl(`assets/terms/${global.lang}.txt`);
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
