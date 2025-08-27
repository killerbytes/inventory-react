import VariantCopyTemplateForm from "../forms/VariantCopyTemplateForm";
import Modal from "../Modal";

export default function VariantCopyTemplateModal({
  selected,
  onClose,
  isOpen,
}: {
  selected: any;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Save to Variant Template"
      description="Save as new Variant Template"
      size="sm"
    >
      <VariantCopyTemplateForm selected={selected} />
    </Modal>
  );
}
