import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalDataService } from '../../services/global-data.service';

@Component({
    selector: 'app-sign',
    templateUrl: './sign.component.html',
    styleUrls: ['./sign.component.css']
})
export class SignComponent implements OnInit {
    public callback?: string;
    public data?: string;

    constructor(
        public global: GlobalDataService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.global.auth.authState.subscribe((user) => {
            if (user == null) {
                this.router.navigate(["/accounts/login"]);
                return;
            }
            this.global.initialize().then(() => {
                this.callback = this.route.snapshot.queryParamMap.get("callback")!;
                this.data = this.route.snapshot.queryParamMap.get("data")!;
            });
        });
    }

    public sign() {
        let signature: string = this.global.account!.signMessage(this.data!);
        let publicKey = this.global.account!.publicKey;

        let url = this.callback! + "?data=" + this.data + "&signature=" + signature + "&public-key=" + publicKey;
        window.location.href = url;
    }

    public translation = {
        callback: {
            en: "Callback",
            ja: "コールバック先"
        },
        caution: {
            en: "Are you sure to provide digital signatures to the service of this URL?",
            ja: "以下のURLのサービスに、このウォレットのデジタル署名を提供しますか？"
        },
        data: {
            en: "Data",
            ja: "データ"
        },
        sign: {
            en: "Sign",
            ja: "署名"
        }
    } as {[key: string]: {[key: string]: string}};
}
