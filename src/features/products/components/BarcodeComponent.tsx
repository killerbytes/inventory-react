import { cx } from "class-variance-authority";
import Barcode from "react-barcode";

export default function BarcodeComponent({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center text-xs", className)}>
      {label && <span className="text-xs">{label}</span>}
      <Barcode
        value={String(value)}
        width={1}
        height={30}
        fontSize={11}
        margin={0}
        textMargin={0}
      />
    </div>
  );
}
