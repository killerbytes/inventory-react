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
    <div className={cx("flex flex-col items-center", className)}>
      {label && <span className="text-[10px] font-mono">{label}</span>}
      <Barcode
        value={String(value)}
        width={1.5}
        height={20}
        fontSize={10}
        margin={0}
        textMargin={0}
        className="tracking-widest"
      />
    </div>
  );
}
