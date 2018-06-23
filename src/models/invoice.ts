export class Invoice {
    public v = 2;
    public type = 2;
    public data = {
        addr: "",
        msg: "",
        name: "LCNEM Wallet",
        amount: 0
    }

    public generate() {
        return encodeURI(JSON.stringify(this));
    }

    public static read(json?: string) {
        if(!json) {
            return null;
        }

        let decoded = decodeURI(json);
        let invoice: any;
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
        
        return invoice;
    }
};