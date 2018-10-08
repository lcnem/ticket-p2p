import { firestore } from "firebase";
import { Sale } from "./sale";

export interface Event {
  name: string,
  privateKey: string,
  sellingStarted: boolean,
  groups: {
    name: string,
    capacity: number
  }[],
  date: firestore.Timestamp
}
