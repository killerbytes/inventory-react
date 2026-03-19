import { PaymentApplication, PaymentInput } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class PaymentService extends BaseService<
  PaymentApplication | PaymentInput
> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/payments" });
  }
}
