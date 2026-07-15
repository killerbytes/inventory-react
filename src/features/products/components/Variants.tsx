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

import { hasRole, ROLES } from "@/utils/permissions";
import { ToggleUpdater } from "@/hooks/useToggle";
import ShowMore from "@/components/ShowMore";
import { useStore } from "@/stores";

export default function Variants({
  variants,
  handleToggle,
}: {
  variants: VariantTypes[];
  handleToggle: (updater: ToggleUpdater) => void;
}) {
  const { authState } = useStore();

  return (
    <>
      <Card>
        <CardHeader className="items-center justify-between flex">
          <CardTitle>Variant Types</CardTitle>
          <CardAction>
            {hasRole(authState.user.role, [ROLES.ADMIN, ROLES.MANAGER]) && (
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
                variant="secondary"
                className="shadow-sm"
              >
                <Pencil />
                Edit Variants
              </Button>
            )}
          </CardAction>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue={variants
              .find((i) => i.isBreakpackFilter)
              ?.id?.toString()}
            className="grid md:grid-cols-4 gap-4"
          >
            {variants.map((variant) => (
              <FieldLabel key={variant.id} htmlFor={variant.id?.toString()}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle className="uppercase text-xs font-semibold text-muted-foreground">
                      {variant.name}
                    </FieldTitle>
                    <ShowMore>
                      <ul className="text-xs flex gap-1 flex-col">
                        {variant.values
                          .sort((a, b) => a.value.localeCompare(b.value))
                          .map((i) => (
                            <li key={i.id}>{i.value}</li>
                          ))}
                      </ul>
                    </ShowMore>
                  </FieldContent>
                  <RadioGroupItem
                    className="hidden"
                    value={variant.id?.toString() || ""}
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
