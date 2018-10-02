import { firestore } from "firebase";
import { Purchase } from "./purchase";

export interface Event {
  name: string,
  privateKey: string,
  sellingStarted: boolean,
  sellingEnded: boolean,
  groups: {
    name: string,
    capacity: number
  }[],
  date: firestore.Timestamp
}
