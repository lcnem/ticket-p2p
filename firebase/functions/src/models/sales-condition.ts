import { Group } from "./group";
import { Sale } from "./sales";

export class SalesCondition {
  public groups: {
    name: string,
    sales: number,
    capacity: number
  }[];
  public reservations: string[];

  public static async getFromFirebase(eventRef: FirebaseFirestore.DocumentReference) {
    const groups = await eventRef.collection("groups").get();
    const groupsData = groups.docs.map(group => group.data() as Group);

    const sales = await eventRef.collection("sales").get();
    const salesData = sales.docs.map(sale => sale.data() as Sale);
    
    let ret: SalesCondition = {
      groups: [],
      reservations: salesData.map(sales => sales.reservation)
    }

    for(let group of groupsData) {
      let index = ret.groups.findIndex(g => g.name == group.name);
      if(index != -1) {
        ret.groups[index].capacity += group.capacity;
        continue;
      }

      ret.groups.push({
        name: group.name,
        sales: salesData.filter(sale => sale.group == group.name).length,
        capacity: group.capacity
      });
    }

    return ret;
  }
}
