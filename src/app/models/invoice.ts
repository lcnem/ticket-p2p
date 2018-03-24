import { isNumber } from "util";

export class Invoice {
    public v = 2;
    public type = 2;

    public constructor(
        public data: {
        addr: string,
        amount: number,
        msg: string,
        name: string
        }
    ) {
    }

    public static generate(address: string, amount: number, message: string, name: string) {
        let invoice = new Invoice({addr: address, amount, msg: message, name});
        if (!invoice.data.amount) {
            invoice.data.amount = 0;
        }
        return encodeURI(JSON.stringify(invoice));
    }

    public static read(json: string): Invoice {
        let invoice = JSON.parse(json);
        if (invoice.v != 2) {
            return null;
        }
        if(invoice.type != 2) {
            return null;
        }
        if (invoice.data == null) {
            return null;
        }
        if(!isNumber(invoice.data.amount)) {
            return null;
        }
        return invoice;
    }
}