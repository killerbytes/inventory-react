import { Invoice, invoiceForm } from "@/types";
import BaseService from "./base";
import type Http from "./http";

export default class InvoiceService extends BaseService<Invoice | invoiceForm> {
  constructor(props: { http: Http }) {
    super({ ...props, url: "/invoices" });
  }
}
