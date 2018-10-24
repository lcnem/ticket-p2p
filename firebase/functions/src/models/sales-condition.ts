import { Group } from "../../../../models/group";
import { Sale } from "../../../../models/sale";

export class SalesCondition {
  public groups: {
    name: string,
    sales: number,
    capacity: number
  }[] = [];
  public reservations: string[] = [];

  public static async getFromFirebase(eventRef: FirebaseFirestore.DocumentReference) {
    const groups = await eventRef.collection("groups").get();
    const groupsData = groups.docs.map(group => group.data() as Group);

    const sales = await eventRef.collection("sales").get();
    const salesData = sales.docs.map(sale => sale.data() as Sale);
    
    const ret: SalesCondition = {
      groups: [],
      reservations: salesData.map(sale => sale.reservation)
    }

    for(const group of groupsData) {
      const index = ret.groups.findIndex(g => g.name === group.name);
      if(index !== -1) {
        ret.groups[index].capacity += group.capacity;
        continue;
      }

      ret.groups.push({
        name: group.name,
        sales: salesData.filter(sale => sale.group === group.name).length,
        capacity: group.capacity
      });
    }

    return ret;
  }
}
