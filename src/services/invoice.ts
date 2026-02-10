import { Invoice, InvoiceCreate, invoiceForm } from "@/schemas";
import BaseService from "./base";
import type Http from "./http";

export default class InvoiceService extends BaseService<
  Invoice | invoiceForm | InvoiceCreate
> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/invoices" });
  }
}
