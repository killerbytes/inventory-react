import { Payment } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class PaymentService extends BaseService<Payment> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/payments" });
  }
}
