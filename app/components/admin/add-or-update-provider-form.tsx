import { Provider } from "@prisma/client";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertProviderSchema } from "~/lib/schema";
import { useModal } from "../providers/modal-provider";
import { Button } from "../ui/button";
import { FormField } from "../shared/form/form-field";
import { Label } from "../ui/label";
import { InputField } from "../shared/form/form-fields/input-field";
import { ErrorMessage } from "../shared/form/error-message";
import { useState } from "react";
import { ImageSelector } from "./image-selector";
import { useNavigate } from "@remix-run/react";

export const AddOrUpdateProviderForm = ({
  provider,
}: {
  provider?: Provider;
}) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | undefined>(
    provider?.image ?? undefined,
  );
  const { fetcher, formRef, control } = useForm<typeof insertProviderSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: provider?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
      navigate("/admin/providers");
    },
    defaultValues: {
      ...provider,
      image: provider?.image ?? undefined,
      address: provider?.address ?? undefined,
    },
  });

  return (
    <div>
      <fetcher.Form
        action={
          provider?.id
            ? `/admin/providers/${provider.id}`
            : "/admin/providers/add"
        }
        method={provider?.id ? "PUT" : "POST"}
        ref={formRef}
      >
        <div className="flex flex-col space-y-4">
          <ImageSelector
            initialImage={provider?.image ?? undefined}
            mediaType="provider"
            onImageSelected={setImage}
            placeholderText="Chọn ảnh nhà cung cấp"
          />

          <FormField control={control} name="name">
            <Label>Tên nhà cung cấp</Label>
            <InputField />
            <ErrorMessage />
          </FormField>

          <FormField control={control} name="address">
            <Label>Địa chỉ</Label>
            <InputField />
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
          {provider?.id ? "Cập nhật nhà cung cấp" : "Tạo nhà cung cấp"}
        </Button>
      </fetcher.Form>
    </div>
  );
};
