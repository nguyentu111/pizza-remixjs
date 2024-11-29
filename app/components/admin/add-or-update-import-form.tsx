import { Import, Material, Provider } from "@prisma/client";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { FormControl, useForm } from "~/hooks/use-form";
import { ErrorMessage } from "../shared/form/error-message";
import { FormField } from "../shared/form/form-field";
import { DateField } from "../shared/form/form-fields/date-field";
import { InputField } from "../shared/form/form-fields/input-field";
import { SelectField } from "../shared/form/form-fields/select-field";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { FileSelector } from "./file-selector";

type ImportFormData = {
  providerId: string;
  totalAmount: number;
  expectedDeliveryDate?: Date;
  quotationLink?: string;
  materials: Array<{
    materialId: string;
    expectedQuantity: number;
    qualityStandard?: string | null;
    expiredDate?: Date | null;
    pricePerUnit?: number | null;
  }>;
};

export function AddOrUpdateImportForm({
  import_,
}: {
  import_?: Import & {
    ImportMaterials: Array<{
      materialId: string;
      expectedQuantity: number;
      qualityStandard?: string | null;
      expiredDate?: Date | null;
      pricePerUnit?: number | null;
    }>;
  };
}) {
  const { providers, materials } = useLoaderData<{
    providers: Provider[];
    materials: Material[];
  }>();
  const actionData = useActionData<{ error?: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ImportFormData>({
    providerId: import_?.providerId || "",
    totalAmount: import_ ? Number(import_.totalAmount) : 0,
    expectedDeliveryDate: import_?.expectedDeliveryDate || undefined,
    quotationLink: import_?.quotationLink || undefined,
    materials: import_?.ImportMaterials || [
      {
        materialId: "",
        expectedQuantity: 0,
        qualityStandard: "",
        expiredDate: undefined,
        pricePerUnit: undefined,
      },
    ],
  });
  const { fetcher, isSubmitting, fieldErrors, control, formRef } = useForm<
    z.ZodType<ImportFormData>
  >({
    defaultValues: formData,
  });

  const addMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          materialId: "",
          expectedQuantity: 0,
          qualityStandard: "",
          expiredDate: undefined,
          pricePerUnit: undefined,
        },
      ],
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const updateMaterial = (
    index: number,
    field: keyof ImportFormData["materials"][0],
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.map((material, i) =>
        i === index ? { ...material, [field]: value } : material,
      ),
    }));
  };
  return (
    <div className="max-w-2xl mx-auto p-4">
      {" "}
      {/* Responsive container */}
      <fetcher.Form
        method={import_ ? "PUT" : "POST"}
        className="space-y-8"
        ref={formRef}
        action={import_ ? `/admin/imports/${import_.id}` : "/admin/imports/add"}
      >
        <div className="space-y-4">
          <div>
            <FormField control={control} name="providerId">
              <Label>Nhà cung cấp</Label>
              <SelectField
                required
                options={providers.map((provider) => ({
                  label: provider.name,
                  value: provider.id,
                }))}
                placeholder="Chọn nhà cung cấp"
              />
            </FormField>
          </div>

          <div>
            <Label>Ngày dự kiến nhận hàng</Label>
            <FormField control={control} name="expectedDeliveryDate">
              <DateField placeholder="Chọn ngày" />
              <ErrorMessage />
            </FormField>
          </div>

          <div>
            <Label>Bảng báo giá</Label>
            <FormField control={control} name="quotationLink">
              <FileSelector
                initialFile={formData.quotationLink}
                mediaType="raw"
                placeholderText="Tải lên bảng báo giá (PDF, Excel, Word...)"
                onFileSelected={(fileUrl) =>
                  setFormData((prev) => ({ ...prev, quotationLink: fileUrl }))
                }
              />
              <input
                type="hidden"
                name="quotationLink"
                value={formData.quotationLink || ""}
              />
              <ErrorMessage />
            </FormField>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Danh sách nguyên liệu</Label>
              <Button type="button" onClick={addMaterial}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Thêm nguyên liệu
              </Button>
            </div>

            {formData.materials.map((material, index) => (
              <MaterialForm
                control={control}
                key={index}
                materials={materials as unknown as Material[]}
                material={material}
                index={index}
                removeMaterial={() => removeMaterial(index)}
                updateMaterial={(field, value) =>
                  updateMaterial(index, field, value)
                }
                hasQuotationLink={!!formData.quotationLink}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {import_ ? "Cập nhật phiếu nhập" : "Tạo phiếu nhập"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Hủy
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}

function MaterialForm<T extends FormControl>({
  material,
  index,
  removeMaterial,
  updateMaterial,
  materials,
  hasQuotationLink,
  control,
}: {
  control: T;
  materials: Material[];
  material: ImportFormData["materials"][0];
  index: number;
  removeMaterial: () => void;
  updateMaterial: (
    field: keyof ImportFormData["materials"][0],
    value: any,
  ) => void;
  hasQuotationLink: boolean;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex justify-between">
        <Label>Nguyên liệu {index + 1}</Label>
        <Button
          type="button"
          variant="ghost-destructive"
          onClick={() => removeMaterial()}
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormField control={control} name={`materials[${index}].materialId`}>
            <Label>Chọn nguyên liệu</Label>
            <SelectField
              required
              options={materials.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
              placeholder="Chọn nguyên liệu"
              onValueChange={(value) => updateMaterial("materialId", value)}
            />
            <ErrorMessage />
          </FormField>
        </div>

        <div>
          <FormField
            control={control}
            name={`materials[${index}].expectedQuantity`}
          >
            <Label>
              Số lượng dự kiến
              <span className="ml-2">
                ({materials.find((m) => m.id === material.materialId)?.unit})
              </span>
            </Label>
            <InputField
              required
              type="number"
              onChange={(e) =>
                updateMaterial("expectedQuantity", Number(e.target.value))
              }
            />
            <ErrorMessage />
          </FormField>
        </div>

        <div>
          <FormField
            control={control}
            name={`materials[${index}].qualityStandard`}
          >
            <Label>Tiêu chuẩn chất lượng</Label>
            <InputField
              onChange={(e) =>
                updateMaterial("qualityStandard", e.target.value)
              }
            />
            <ErrorMessage />
          </FormField>
        </div>

        <>
          <div>
            <FormField
              control={control}
              name={`materials[${index}].expiredDate`}
            >
              <Label>Hạn sử dụng</Label>
              <DateField placeholder="Chọn ngày" />
              <ErrorMessage />
            </FormField>
          </div>

          <div>
            <FormField
              control={control}
              name={`materials[${index}].pricePerUnit`}
            >
              <Label>Đơn giá</Label>
              <InputField
                type="number"
                onChange={(e) =>
                  updateMaterial("pricePerUnit", Number(e.target.value))
                }
                required={hasQuotationLink}
                placeholder="Nhập đơn giá..."
              />
              <ErrorMessage />
            </FormField>
          </div>
        </>
      </div>
    </div>
  );
}
