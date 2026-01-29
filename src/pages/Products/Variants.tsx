import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  CardAction,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { variantTypesServices } from "@/services";
import { Button } from "@/components/ui/button";
import VariantsModal from "./VariantsModal";
import useToggle from "@/hooks/useToggle";
import { useParams } from "react-router";
import { VariantTypes } from "@/types";
import { Pencil } from "lucide-react";

export default function Variants({ variants }: { variants: VariantTypes[] }) {
  const { id } = useParams();

  const [toggle, handleToggle] = useToggle({
    variantModal: false,
  });

  const handleVariantChange = async (variant: VariantTypes) => {
    const payload = {
      isBreakpackFilter: variant.isBreakpackFilter,
      productId: Number(id),
    };

    await variantTypesServices.update(variant.id, payload);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Variant Types</CardTitle>
          <CardAction>
            <Button
              onClick={() => handleToggle({ variantModal: true })}
              type="button"
              variant="outline"
              className="shadow-sm"
            >
              <Pencil />
              Edit Variants
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue={variants
              .find((i) => i.isBreakpackFilter)
              ?.id?.toString()}
            className="flex"
          >
            {variants.map((variant) => (
              <FieldLabel htmlFor={variant.id?.toString()}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{variant.name}</FieldTitle>
                    <FieldDescription>
                      <ul className="text-sm flex gap-1 flex-col">
                        {variant.values.map((i) => (
                          <li>{i.value}</li>
                        ))}
                      </ul>
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    value={variant.id?.toString() || ""}
                    // id={variant.id?.toString()}
                  />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      {toggle.variantModal && (
        <VariantsModal
          productId={Number(id)}
          isOpen={true}
          onClose={(shouldOpenComboModal) => {
            handleToggle({ variantModal: false });
            if (shouldOpenComboModal) {
              handleToggle({ combinationModal: true });
            }
          }}
        />
      )}
    </>
  );
}
