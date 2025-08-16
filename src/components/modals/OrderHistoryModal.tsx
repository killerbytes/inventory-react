import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { formatDateTime } from "@/utils/formatters";
import { STATUS_COLOR } from "@/utils/definitions";
import { StatusHistory } from "@/types";
import ColorBadge from "../ColorBadge";
import Modal from "../Modal";

export default function OrderHistoryModal({
  data,
  onClose,
}: {
  data: StatusHistory[];
  onClose: () => void;
}) {
  return (
    <Modal title="Order History" isOpen={true} onOpenChange={onClose}>
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
                <ColorBadge colorMap={STATUS_COLOR}>
                  {String(statusHistory.status)}
                </ColorBadge>
              </TableCell>
              <TableCell>{statusHistory.user.username}</TableCell>
              <TableCell>{formatDateTime(statusHistory.changedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Modal>
  );
}
