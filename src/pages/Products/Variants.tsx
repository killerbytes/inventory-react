import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { VariantTypes } from "@/schemas";
import { Pencil } from "lucide-react";

import { ToggleUpdater } from "@/hooks/useToggle";

export default function Variants({
  variants,
  handleToggle,
}: {
  variants: VariantTypes[];
  handleToggle: (updater: ToggleUpdater) => void;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Variant Types</CardTitle>
          <CardAction>
            <Button
              onClick={() =>
                handleToggle((prevState) => {
                  return {
                    ...prevState,
                    variantModal: true,
                  };
                })
              }
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
              <FieldLabel key={variant.id} htmlFor={variant.id?.toString()}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{variant.name}</FieldTitle>
                    <ul className="text-sm flex gap-1 flex-col text-muted-foreground">
                      {variant.values.map((i) => (
                        <li key={i.id}>{i.value}</li>
                      ))}
                    </ul>
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
    </>
  );
}
