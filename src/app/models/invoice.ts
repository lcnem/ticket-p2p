import { isNumber } from "util";

export class Invoice {
    public v = 2;
    public type = 2;
    public data = {
        addr : "",
        msg: "",
        name: "",
        mosaics: new Array<{name: string, quantity: number}>()
    };

    public generate() {
        return encodeURI(JSON.stringify(this));
    }

    public static read(json: string): Invoice {
        let decoded = decodeURI(json);
        let invoice: Invoice;
        try {
            console.log(decoded);
            invoice = eval("(" + decoded + ")") 
        }
        catch {
            return null;
        }
        if (invoice.v != 2) {
            return null;
        }
        if (invoice.type != 2) {
            return null;
        }
        if (invoice.data == null) {
            return null;
        }
        if(invoice.data.addr == null) {
            return null;
        }
        if(invoice.data.msg == null) {
            return null;
        }
        if(invoice.data.name == null) {
            return null;
        }
        if (invoice.data.mosaics == null) {
            if(isNumber((invoice.data as any).amount)) {
                invoice.data.mosaics = new Array<{name: string, quantity: number}>();
                invoice.data.mosaics.push({name: "nem:xem", quantity: (invoice.data as any).amount});
            }
        }
        invoice.data.mosaics.forEach(m => {
            if(!isNumber(m.quantity)) {
                m.quantity = 0;
            }
        });
       
        return invoice;
    }
}