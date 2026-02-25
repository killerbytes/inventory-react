import { Invoice, InvoiceForm, InvoiceInput } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class InvoiceService extends BaseService<
  Invoice | InvoiceInput | InvoiceForm
> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/invoices" });
  }
}
