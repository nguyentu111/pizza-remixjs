import type { CheckboxProps } from "@radix-ui/react-checkbox";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { useFormField } from "../form-field";
export const CheckboxesGroupField = ({
  checkboxes,
}: {
  checkboxes: (CheckboxProps & { label: string; value: string })[];
}) => {
  const { name } = useFormField();
  return (
    <div className="flex flex-wrap gap-8">
      {checkboxes.map((r, i) => (
        <div key={r.value} className="flex items-center h-9">
          <Checkbox
            id={r.value}
            name={name as string}
            className={cn("block", r.className)}
            {...r}
          />
          <Label htmlFor={r.value} className="ml-2">
            {r.label}
          </Label>
        </div>
      ))}
    </div>
  );
};
