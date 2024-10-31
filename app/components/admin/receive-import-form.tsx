import { Import, ImportMaterial, Material } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "~/hooks/use-form";
import { ErrorMessage } from "../shared/form/error-message";
import { FormField } from "../shared/form/form-field";
import { DateField } from "../shared/form/form-fields/date-field";
import { InputField } from "../shared/form/form-fields/input-field";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Label } from "../ui/label";

type ReceiveFormData = {
  materials: Array<{
    materialId: string;
    actualGood: number;
    actualDefective: number;
    expiredDate?: Date;
    pricePerUnit?: number;
  }>;
};

export function ReceiveImportForm({
  import_,
}: {
  import_: Import & {
    ImportMaterials: Array<
      ImportMaterial & {
        Material: Material;
      }
    >;
  };
}) {
  const navigate = useNavigate();
  const materials = import_.ImportMaterials.map((m) => ({
    materialId: m.materialId,
    actualGood: Number(m.actualGood) || 0,
    actualDefective: Number(m.actualDefective) || 0,
    expiredDate: m.expiredDate || undefined,
    pricePerUnit: m.pricePerUnit ? Number(m.pricePerUnit) : undefined,
  }));
  const { fetcher, isSubmitting, control } = useForm<
    z.ZodType<ReceiveFormData>
  >({
    defaultValues: {
      materials,
    },
    onSuccess: () => {
      navigate("/admin/imports");
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <fetcher.Form method="PUT" className="space-y-6">
        {materials.map((material, index) => {
          const importMaterial = import_.ImportMaterials[index];
          return (
            <Card key={material.materialId} className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {importMaterial.Material.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Số lượng dự kiến: {importMaterial.expectedQuantity.toString()}{" "}
                  {importMaterial.Material.unit}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`materials[${index}].actualGood`}
                >
                  <Label>Số lượng đạt yêu cầu</Label>
                  <InputField
                    type="number"
                    min={0}
                    required
                    placeholder={`Nhập số lượng (${importMaterial.Material.unit})`}
                  />
                  <ErrorMessage />
                </FormField>

                <FormField
                  control={control}
                  name={`materials[${index}].actualDefective`}
                >
                  <Label>Số lượng không đạt</Label>
                  <InputField
                    type="number"
                    min={0}
                    required
                    placeholder={`Nhập số lượng (${importMaterial.Material.unit})`}
                  />
                  <ErrorMessage />
                </FormField>

                <FormField
                  control={control}
                  name={`materials[${index}].expiredDate`}
                >
                  <Label>Hạn sử dụng</Label>
                  <DateField placeholder="Chọn ngày" />
                  <ErrorMessage />
                </FormField>

                <FormField
                  control={control}
                  name={`materials[${index}].pricePerUnit`}
                >
                  <Label>Đơn giá</Label>
                  <InputField
                    readOnly
                    type="number"
                    min={0}
                    placeholder="Nhập đơn giá"
                    className="bg-gray-100"
                  />
                  <ErrorMessage />
                </FormField>
              </div>

              <input
                type="hidden"
                name={`materials[${index}].materialId`}
                value={material.materialId}
              />
            </Card>
          );
        })}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Cập nhật"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}
