import { Button } from "@/components/ui/button";
import { CardAction,  Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import useToggle from "@/hooks/useToggle";
import { Pencil } from "lucide-react";
import VariantsModal from "./VariantsModal";
import { Badge } from "@/components/ui/badge";
import { cx } from "class-variance-authority";
import { VariantTypes } from "@/types";



export default function Variants({id, variants}: {id: string, variants: VariantTypes[]}) {
    const [toggle, handleToggle] = useToggle({
      variantModal: false,
    });
  
    return            <>

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


    <RadioGroup defaultValue={variants.find((i) => i.isBreakpackFilter)?.id?.toString()} className="max-w-sm">
      {variants.map((variant, idx)=>
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
          <RadioGroupItem value={variant.id?.toString() || ""} id={variant.id?.toString()} />
        </Field>
      </FieldLabel>
      )}
    </RadioGroup>

                        <div className="flex gap-4">
                          {variants.map((variant, idx) => {
                            return (
                              <div className="flex flex-col gap-2">
                                <Badge
                                  variant="secondary"
                                  key={idx}
                                  className={cx("outline", {
                                    "font-bold italic underline":
                                      variant.isBreakpackFilter,
                                  })}
                                >
                                  {variant.name}
                                </Badge>

                                <ul className="text-sm flex gap-1 flex-col">
                                  {variant.values.map((i) => (
                                    <li>{i.value}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
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

}   