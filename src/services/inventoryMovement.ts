import { InventoryMovement } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class InventoryMovementService extends BaseService<InventoryMovement> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/inventoryMovements" });
  }
}
