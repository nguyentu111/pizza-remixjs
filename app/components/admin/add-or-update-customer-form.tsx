import { Customer } from "@prisma/client";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { updateCustomerSchema } from "~/lib/schema";
import { getSmallImageUrl } from "~/lib/utils";
import { useModal } from "../providers/modal-provider";
import { MediaButton } from "../shared/media-button";
import { Button } from "../ui/button";
import { useState } from "react";
import { Label } from "../ui/label";
import { FormField } from "../shared/form/form-field";
import { InputField } from "../shared/form/form-fields/input-field";
import { SwitchField } from "../shared/form/form-fields/switch-field";
import { ErrorMessage } from "../shared/form/error-message";

interface AddOrUpdateCustomerFormProps {
  customer?: Customer;
}

export function AddOrUpdateCustomerForm({
  customer,
}: AddOrUpdateCustomerFormProps) {
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    customer?.avatarUrl ?? undefined,
  );
  const { setClose } = useModal();

  const { fetcher, formRef, control } = useForm<typeof updateCustomerSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh! Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: customer?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
    defaultValues: {
      fullname: customer?.fullname,
      phoneNumbers: customer?.phoneNumbers,
      status: customer?.status ?? "on",
      avatarUrl: customer?.avatarUrl ?? undefined,
    },
  });

  return (
    <fetcher.Form
      action={
        customer?.id
          ? `/admin/customers/${customer.id}`
          : "/admin/customers/add"
      }
      method={customer?.id ? "PUT" : "POST"}
      ref={formRef}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row w-full md:gap-4">
        {/* Avatar Section */}
        <div className="md:w-1/4">
          <div
            className="object-cover aspect-square h-[200px] mb-4 flex items-center justify-center border-2 border-black"
            style={{
              backgroundImage: avatarUrl
                ? `url(${getSmallImageUrl(avatarUrl)})`
                : undefined,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <MediaButton
              type="button"
              mediaType="user"
              className="!px-0 w-full h-full"
              variant="link"
              selectedMedia={customer?.avatarUrl ?? undefined}
              onSelected={(media) => {
                setAvatarUrl(media.url);
              }}
            >
              {avatarUrl ? "" : "Chọn ảnh đại diện"}
            </MediaButton>
          </div>
        </div>

        {/* Main Form Fields */}
        <div className="md:w-3/4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <FormField control={control} name="fullname">
                <Label>Họ tên</Label>
                <InputField />
                <ErrorMessage />
              </FormField>

              <FormField control={control} name="phoneNumbers">
                <Label>Số điện thoại</Label>
                <InputField />
                <ErrorMessage />
              </FormField>
            </div>

            {/* Account Settings */}
            <div className="space-y-4">
              <FormField control={control} name="status">
                <Label>Trạng thái</Label>
                <SwitchField />
                <ErrorMessage />
              </FormField>

              <FormField control={control} name="password">
                <Label>Mật khẩu mới</Label>
                <InputField type="password" />
                <ErrorMessage />
              </FormField>

              <FormField control={control} name="passwordConfirm">
                <Label>Xác nhận mật khẩu</Label>
                <InputField type="password" />
                <ErrorMessage />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Avatar URL Field */}
      <input
        value={avatarUrl ?? ""}
        name="avatarUrl"
        className="hidden"
        onChange={() => {}}
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Hủy
        </Button>
        <Button type="submit">{customer?.id ? "Cập nhật" : "Thêm mới"}</Button>
      </div>
    </fetcher.Form>
  );
}
