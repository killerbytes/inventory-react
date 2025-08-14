import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatDateTime } from "@/utils/formatters";
import StatusBadge from "./StatusBadge";
import { StatusHistory } from "@/types";

export default function OrderHistory({ data }: { data: StatusHistory[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Changed By</TableHead>
              <TableHead>Changed Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((statusHistory) => (
              <TableRow key={statusHistory.id}>
                <TableCell>
                  <StatusBadge>{String(statusHistory.status)}</StatusBadge>
                </TableCell>
                <TableCell>{statusHistory.user.name}</TableCell>
                <TableCell>{formatDateTime(statusHistory.changedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
