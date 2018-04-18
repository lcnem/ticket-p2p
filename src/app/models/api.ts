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

    public get imageUrl(): string {
        return "https://lcnem.github.io/wallet/" + this.namespace + "/" + this.name + ".svg";
    }

    public getPrice(amount: number): number {
        return this.rate * amount / Math.pow(10, this.divisibility);
    }

    public getAmount(price: number): number {
        return price * Math.pow(10, this.divisibility) / this.rate;
    }
}

export class LcnemApi {
    
    public static async loadMosaicData(http: HttpClient): Promise<MosaicData[]> {
        let ret = new Array<MosaicData>();
        let result = await http.get<MosaicData[]>('https://lcnem.github.io/wallet/index.json').toPromise();
        result.forEach(m => {
            let newOne = new MosaicData();
            newOne.namespace = m.namespace;
            newOne.name = m.name;
            newOne.divisibility = m.divisibility;
            newOne.unit = m.unit;
            newOne.rate = m.rate;
            newOne.issuer = m.issuer;
            newOne.site = m.site;
            ret.push(newOne);
        })
        return ret;
    }
}