import { Material } from "@prisma/client";
import { Control } from "react-hook-form";
import { Button } from "../ui/button";
import { SelectField } from "../shared/form/hook-form-fields/select-field";
import { InputField } from "../shared/form/hook-form-fields/input-field";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useWatch } from "react-hook-form";

interface DynamicRecipeFormProps {
  control: Control<any>;
  materials: Material[];
  defaultValues?: Array<{ materialId: string; quantity: number }>;
}

export const DynamicRecipeForm = ({
  control,
  materials,
  defaultValues,
}: DynamicRecipeFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipes",
  });

  // Watch current selected materials
  const selectedRecipes = useWatch({
    control,
    name: "recipes",
  });

  // Get array of selected materialIds
  const selectedMaterialIds =
    selectedRecipes?.map((recipe: any) => recipe.materialId) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Công thức</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ materialId: "", quantity: "" })}
          // Disable button if all materials are selected
          disabled={selectedMaterialIds.length === materials.length}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm nguyên liệu
        </Button>
      </div>

      {fields.map((field, index) => {
        // Filter out already selected materials except current field
        const availableMaterials = materials.filter(
          (material) =>
            !selectedMaterialIds.includes(material.id) ||
            material.id === selectedRecipes[index]?.materialId,
        );

        return (
          <div key={field.id} className="flex gap-4 items-start">
            <SelectField
              control={control}
              name={`recipes.${index}.materialId`}
              label="Nguyên liệu"
              placeholder="Chọn nguyên liệu"
              options={availableMaterials.map((material) => ({
                label: `${material.name} (${material.unit})`,
                value: material.id,
              }))}
            />
            <InputField
              control={control}
              name={`recipes.${index}.quantity`}
              label="Số lượng"
              type="number"
              placeholder="Nhập số lượng"
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
