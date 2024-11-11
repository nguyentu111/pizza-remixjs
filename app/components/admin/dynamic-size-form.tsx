import { Size } from "@prisma/client";
import { Control } from "react-hook-form";
import { Button } from "../ui/button";
import { SelectField } from "../shared/form/hook-form-fields/select-field";
import { InputField } from "../shared/form/hook-form-fields/input-field";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useWatch } from "react-hook-form";

interface DynamicSizeFormProps {
  control: Control<any>;
  sizes: Size[];
  defaultValues?: Array<{ sizeId: string; price: number }>;
}

export const DynamicSizeForm = ({
  control,
  sizes,
  defaultValues,
}: DynamicSizeFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes",
  });

  // Watch current selected sizes
  const selectedSizes = useWatch({
    control,
    name: "sizes",
  });

  // Get array of selected sizeIds
  const selectedSizeIds = selectedSizes?.map((size: any) => size.sizeId) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Kích thước và giá</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ sizeId: "", price: "" })}
          // Disable button if all sizes are selected
          disabled={selectedSizeIds.length === sizes.length}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm kích thước
        </Button>
      </div>

      {fields.map((field, index) => {
        // Filter out already selected sizes except current field
        const availableSizes = sizes.filter(
          (size) =>
            !selectedSizeIds.includes(size.id) ||
            size.id === selectedSizes[index]?.sizeId,
        );

        return (
          <div key={field.id} className="flex gap-4 items-start">
            <SelectField
              control={control}
              name={`sizes.${index}.sizeId`}
              label="Kích thước"
              placeholder="Chọn kích thước"
              options={availableSizes.map((size) => ({
                label: size.name,
                value: size.id,
              }))}
            />
            <InputField
              control={control}
              name={`sizes.${index}.price`}
              label="Giá"
              type="number"
              placeholder="Nhập giá"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-8"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};
