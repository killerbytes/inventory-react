import type { Supplier } from "@/pages/Suppliers";
import BaseService from "./base";
import type Http from "./http";

export default class PurchaseOrderService extends BaseService<PurchaseOrder> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/purchase" });
  }
}
