import { Border } from "@prisma/client";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertBorderSchema } from "~/lib/schema";
import { useModal } from "../providers/modal-provider";
import { Button } from "../ui/button";
import { FormField } from "../shared/form/form-field";
import { Label } from "../ui/label";
import { InputField } from "../shared/form/form-fields/input-field";
import { ErrorMessage } from "../shared/form/error-message";
import { useState } from "react";
import { ImageSelector } from "./image-selector";

export const AddOrUpdateBorderForm = ({ border }: { border?: Border }) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const [image, setImage] = useState<string | undefined>(
    border?.image ?? undefined,
  );
  const { fetcher, formRef, control } = useForm<typeof insertBorderSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: border?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
    defaultValues: {
      ...border,
      price: border?.price?.toString(),
      image: border?.image ?? undefined,
    },
  });

  return (
    <fetcher.Form
      action={border?.id ? `/admin/borders/${border.id}` : "/admin/borders/add"}
      method={border?.id ? "PUT" : "POST"}
      ref={formRef}
    >
      <div className="flex flex-col space-y-4">
        <ImageSelector
          initialImage={border?.image ?? undefined}
          mediaType="border"
          onImageSelected={setImage}
          placeholderText="Chọn ảnh viền"
        />

        <FormField control={control} name="name">
          <Label>Tên viền</Label>
          <InputField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="price">
          <Label>Giá</Label>
          <InputField type="number" />
          <ErrorMessage />
        </FormField>
      </div>

      <input
        value={image ?? ""}
        name="image"
        className="hidden"
        onChange={() => {}}
      />

      <Button type="submit" className="mt-4">
        {border?.id ? "Cập nhật viền" : "Tạo viền"}
      </Button>
    </fetcher.Form>
  );
};
