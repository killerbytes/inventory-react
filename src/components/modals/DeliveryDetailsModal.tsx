import { formatDate } from "@/utils/formatters";
import { Label } from "../ui/label";
import Modal from "../Modal";

export default function DeliveryDetailsModal({
  data,
  onClose,
}: {
  data: any;
  onClose: () => void;
}) {
  return (
    <Modal title="Delivery Details" isOpen={true} onOpenChange={onClose}>
      <Label htmlFor="terms">Delivery Date</Label>
      <div className="font-semibold text-sm">
        {formatDate(data?.deliveryDate)}
      </div>
      <Label htmlFor="terms">Delivery Address</Label>
      <div className="font-semibold text-sm">{data?.deliveryAddress}</div>
      <Label htmlFor="terms">Delivery Notes</Label>
      <div className="font-semibold text-sm">{data?.deliveryInstructions}</div>
    </Modal>
  );
}
