export class Invoice {
    public v = 2;
    public type = 2;
    public data = {
        addr : "",
        msg: "",
        name: "",
        mosaics: new Array<{name: string, amount: number}>()
    };

    public generate() {
        return encodeURI(JSON.stringify(this));
    }

    public static read(json: string): Invoice | null {
        let decoded = decodeURI(json);
        let invoice: Invoice;
        try {
            invoice = JSON.parse(decoded);
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
            const amount = Number((invoice.data as any).amount);
            if(!isNaN(amount)) {
                invoice.data.mosaics = new Array<{name: string, amount: number}>();
                invoice.data.mosaics.push({name: "nem:xem", amount: amount});
            }
        }
        invoice.data.mosaics.forEach(m => {
            if(isNaN(Number(m.amount))) {
                m.amount = 0;
            }
        });
       
        return invoice;
    }
}