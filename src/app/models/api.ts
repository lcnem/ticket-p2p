import { Account, PublicAccount, Mosaic } from "nem-library";
import { HttpClientModule, HttpClient } from '@angular/common/http';

export class MosaicData {
    public namespace: string;
    public name: string;
    public divisibility: number;
    public unit: string;
    public rate: number;
    public issuer: string;
    public site: string;
    public translation: { [index: string]: MosaicTranslationData; } = {};

    public get imageUrl(): string {
        return "https://lcnem-wallet-server.azurewebsites.net/data/" + this.namespace + "/" + this.name + ".svg";
    }

    public getPrice(amount: number): number {
        return this.rate * amount / Math.pow(10, this.divisibility);
    }

    public getAmount(price: number): number {
        return price * Math.pow(10, this.divisibility) / this.rate;
    }
}
export class MosaicTranslationData {
    public name: string;
    public description: string;
}

export class LcnemApi {
    static publicKey = "ac60184daf5d56da384cf27c0a5685533b5d990582bb4fb85320505f4e1a8e7a";

    public static async Register(http: HttpClient, account: Account): Promise<boolean> {
        const url = 'https://lcnem-wallet-server.azurewebsites.net/api/accounts';
        let result = true;

        let params = {
            cipher: account.encryptMessage(account.publicKey, PublicAccount.createWithPublicKey(this.publicKey)).payload,
            publicKey: account.publicKey,
        };
        await http.post(url, null, { params }).toPromise().catch(() => {result = false;});

        return result;
    }

    public static async loadMosaicData(http: HttpClient): Promise<MosaicData[]> {
        let ret = new Array<MosaicData>();
        let result = await http.get<MosaicData[]>('https://lcnem-wallet-server.azurewebsites.net/data/index.json').toPromise();
        result.forEach(m => {
            let newOne = new MosaicData();
            newOne.namespace = m.namespace;
            newOne.name = m.name;
            newOne.divisibility = m.divisibility;
            newOne.unit = m.unit;
            newOne.rate = m.rate;
            newOne.issuer = m.issuer;
            newOne.site = m.site;
            newOne.translation["ja"] = m.translation["ja"];
            ret.push(newOne);
        })
        return ret;
    }

    public static async loadSelectedMosaic(http: HttpClient, account: Account): Promise<string[]> {
        const url = 'https://lcnem-wallet-server.azurewebsites.net/api/accounts/mosaics';

        let params = {
            cipher: account.encryptMessage(account.publicKey, PublicAccount.createWithPublicKey(this.publicKey)).payload,
            publicKey: account.publicKey
        };
        return await http.get<string[]>(url, { params }).toPromise();
    }

    public static async changeSelectedMosaic(http: HttpClient, account: Account, namespace: string, name: string, post: boolean) {
        const url = 'https://lcnem-wallet-server.azurewebsites.net/api/accounts/mosaics';
        let params = {
            cipher: account.encryptMessage(namespace + ":" + name, PublicAccount.createWithPublicKey(this.publicKey)).payload,
            publicKey: account.publicKey
        };
        if (post) {
            await http.post(url, null, { params }).toPromise();
        } else {
            await http.delete(url, { params }).toPromise();
        }
    }
}