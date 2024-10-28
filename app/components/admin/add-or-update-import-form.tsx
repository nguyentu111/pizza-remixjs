import { Import, Material, Provider, Status } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "~/hooks/use-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { CalendarIcon, PlusIcon, TrashIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button as AriaButton } from "react-aria-components";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as ShadcnCalendar } from "../ui/calendar";
import { z } from "zod";

type ImportFormData = {
  providerId: string;
  totalAmount: number;
  expectedDeliveryDate?: Date;
  materials: Array<{
    materialId: string;
    expectedQuantity: number;
    qualityStandard?: string;
    expiredDate?: Date;
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
    //@ts-ignore
    materials: import_?.ImportMaterials || [
      {
        materialId: "",
        expectedQuantity: 0,
        qualityStandard: "",
        expiredDate: undefined,
      },
    ],
  });

  const { fetcher, isSubmitting, fieldErrors, control, formRef } = useForm<
    z.ZodType<ImportFormData>
  >({
    defaultValues: formData,
    onSuccess: () => navigate(-1), // Navigate on success
    onError: (error) => console.error(error), // Handle error
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
      <fetcher.Form method="post" className="space-y-8" ref={formRef}>
        {actionData?.error && (
          <div className="text-red-500">{actionData.error}</div>
        )}

        <div className="space-y-4">
          <div>
            <Label>Nhà cung cấp</Label>
            <Select
              name="providerId"
              value={formData.providerId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, providerId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhà cung cấp" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Ngày dự kiến nhận hàng</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expectedDeliveryDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expectedDeliveryDate ? (
                    format(formData.expectedDeliveryDate, "PPP")
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <ShadcnCalendar
                  aria-label="Chọn ngày"
                  onSelect={(date: Date | undefined) =>
                    setFormData((prev) => ({
                      ...prev,
                      expectedDeliveryDate: date,
                    }))
                  }
                />
              </PopoverContent>
            </Popover>
            <input
              type="hidden"
              name="expectedDeliveryDate"
              value={formData.expectedDeliveryDate?.toISOString() || ""}
            />
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
                materials={materials as unknown as Material[]}
                material={material}
                key={index}
                index={index}
                removeMaterial={() => removeMaterial(index)}
                updateMaterial={(field, value) =>
                  updateMaterial(index, field, value)
                }
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

const MaterialForm = ({
  material,
  index,
  removeMaterial,
  updateMaterial,
  materials,
}: {
  materials: Material[];
  material: ImportFormData["materials"][0];
  index: number;
  removeMaterial: () => void;
  updateMaterial: (
    field: keyof ImportFormData["materials"][0],
    value: any,
  ) => void;
}) => {
  return (
    <div key={index} className="space-y-4 p-4 border rounded-lg">
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
          <Label>Chọn nguyên liệu</Label>
          <Select
            name={`materials[${index}].materialId`}
            value={material.materialId}
            onValueChange={(value) => updateMaterial("materialId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn nguyên liệu" />
            </SelectTrigger>
            <SelectContent>
              {materials.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Số lượng dự kiến</Label>
          <Input
            type="number"
            name={`materials[${index}].expectedQuantity`}
            value={material.expectedQuantity}
            onChange={(e) =>
              updateMaterial("expectedQuantity", Number(e.target.value))
            }
          />
        </div>

        <div>
          <Label>Tiêu chuẩn chất lượng</Label>
          <Input
            name={`materials[${index}].qualityStandard`}
            value={material.qualityStandard || ""}
            onChange={(e) => updateMaterial("qualityStandard", e.target.value)}
          />
        </div>

        <div>
          <Label>Hạn sử dụng</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !material.expiredDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {material.expiredDate ? (
                  format(material.expiredDate, "PPP")
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ShadcnCalendar
                aria-label="Chọn ngày"
                onSelect={(date: Date | undefined) =>
                  updateMaterial("expiredDate", date)
                }
              />
            </PopoverContent>
          </Popover>
          <input
            type="hidden"
            name={`materials[${index}].expiredDate`}
            value={material.expiredDate?.toISOString() || ""}
          />
        </div>
      </div>
    </div>
  );
};
