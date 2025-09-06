import InvoiceLineTable from "./InvoiceLineTable";

export default function Static({ data }) {
  return <div>{data && <InvoiceLineTable data={data.invoiceLines} />}</div>;
}
