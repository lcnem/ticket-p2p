import { firestore } from "firebase";
import { Purchase } from "./purchase";

export interface Event {
  name: string,
  sellingStarted: boolean,
  sellingEnded: boolean,
  groups: {
    name: string,
    capacity: number
  }[],
  date: firestore.Timestamp
}
