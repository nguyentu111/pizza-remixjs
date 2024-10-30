import { Media, Role, Staff, StaffRole } from "@prisma/client";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertStaffSchema } from "~/lib/schema";
import { getSmallImageUrl } from "~/lib/utils";
import { useModal } from "../providers/modal-provider";
import { MediaButton } from "../shared/media-button";
import { Button } from "../ui/button";
import { useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { FormField } from "../shared/form/form-field";
import { InputField } from "../shared/form/form-fields/input-field";
import { SwitchField } from "../shared/form/form-fields/switch-field";
import { ErrorMessage } from "../shared/form/error-message";
export const AddOrUpdateStaffForm = ({
  roles,
  staff,
}: {
  staff?: Omit<Staff, "id"> & { id?: Staff["id"] } & { Roles: StaffRole[] };
  roles: Role[];
}) => {
  const { toast } = useToast();

  const [image, setImage] = useState<string | undefined>(
    staff?.image ?? undefined,
  );
  const { setClose } = useModal();
  const { fetcher, formRef, control } = useForm<typeof insertStaffSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: staff?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
    defaultValues: {
      ...staff,
      image: staff?.image ?? undefined,
      address: staff?.address ?? undefined,
      salary: staff?.salary ?? undefined,
    },
  });
  return (
    <fetcher.Form
      action={staff?.id ? "/admin/staffs/" + staff.id : "/admin/staffs/add"}
      method={staff?.id ? "PUT" : "POST"}
      ref={formRef}
      encType="multipart/form-data"
    >
      <div className="flex flex-col md:flex-row w-full md:gap-4">
        <div
          className="object-cover  aspect-square h-[200px]  mb-4 flex items-center justify-center border-2 border-black"
          style={{
            backgroundImage: image
              ? `url(${getSmallImageUrl(image)})`
              : undefined,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        >
          <MediaButton
            type="button"
            mediaType="user"
            className="!px-0 w-full h-full"
            variant={"link"}
            selectedMedia={staff?.image ?? undefined}
            onSelected={(media) => {
              setImage(media.url);
            }}
          >
            {image ? "" : "Chọn ảnh đại diện"}
          </MediaButton>
        </div>
        <div className="flex flex-col">
          <FormField control={control} name={"fullname"}>
            <Label>Tên đầy đủ</Label>
            <InputField />
            <ErrorMessage />
          </FormField>
          <FormField control={control} name={"username"}>
            <Label>Tài khoản</Label>
            <InputField />
            <ErrorMessage />
          </FormField>
          <FormField control={control} name={"address"}>
            <Label>Địa chỉ</Label>
            <InputField />
            <ErrorMessage />
          </FormField>
          <FormField control={control} name={"phoneNumbers"}>
            <Label>Số điện thoại</Label>
            <InputField />
            <ErrorMessage />
          </FormField>
        </div>
        <div className="flex flex-col">
          <FormField control={control} name={"status"}>
            <Label>Hoạt động</Label>
            <SwitchField />
            <ErrorMessage />
          </FormField>
          <FormField control={control} name={"password"}>
            <Label>Mật khẩu</Label>
            <InputField type="password" />
            <ErrorMessage />
          </FormField>
          <FormField control={control} name={"passwordConfirm"}>
            <Label>Nhập lại mật khẩu</Label>
            <InputField type="password" />
            <ErrorMessage />
          </FormField>
        </div>
        <div className="mb-4">
          <Label>Quyền</Label>
          <div className="flex flex-wrap gap-8">
            {roles?.map((p) => (
              <div key={p.id} className="flex items-center h-9">
                <Checkbox
                  id={p.id}
                  name="roles[]"
                  value={p.id}
                  defaultChecked={!!staff?.Roles.find((r) => r.roleId === p.id)}
                />
                <Label htmlFor={p.id} className="ml-2">
                  {p.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <input
        value={image ?? ""}
        name="image"
        className="hidden"
        onChange={() => {}}
      />
      <Button type="submit">
        {staff?.id ? "Sửa thông tin" : "Tạo tài khoản"}
      </Button>
    </fetcher.Form>
  );
};
