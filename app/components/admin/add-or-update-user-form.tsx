import { Media, Role, User, UserRole } from "@prisma/client";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertUserSchema } from "~/lib/schema";
import { getSmallImageUrl } from "~/lib/utils";
import { useModal } from "../providers/modal-provider";
import { MediaButton } from "../shared/media-button";
import { Button } from "../ui/button";
import { useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "components/ui/checkbox";

export const AddOrUpdateUserForm = ({
  roles,
  user,
}: {
  user?: Omit<User, "id"> & { id?: User["id"] } & { roles: UserRole[] };
  roles: Role[];
}) => {
  const { toast } = useToast();
  const [avatarId, setAvatarId] = useState<string | undefined>(
    user?.avatarId ?? undefined,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.avatarUrl ?? undefined,
  );
  const { setClose } = useModal();
  const { fetcher, formRef, createInput, createSwitch } = useForm<
    typeof insertUserSchema
  >({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: user?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
  });

  return (
    <fetcher.Form
      action={user?.id ? "/admin/users/" + user.id : "/admin/users"}
      method={user?.id ? "PUT" : "POST"}
      ref={formRef}
      encType="multipart/form-data"
    >
      <div className="flex flex-col md:flex-row w-full md:gap-4">
        <div
          className="object-cover  aspect-square h-[200px]  mb-4 flex items-center justify-center border-2 border-black"
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
            variant={"link"}
            selectedMedia={user?.avatarId ?? undefined}
            onSelected={(media) => {
              setAvatarId(media.publicId);
              setAvatarUrl(media.url);
            }}
          >
            {avatarUrl ? "" : "Chọn ảnh đại diện"}
          </MediaButton>
        </div>
        <div className="flex flex-col">
          {createInput(
            { name: "fullName", defaultValue: user?.fullName },
            { label: "Tên đầy đủ" },
          )}
          {createInput(
            { name: "email", defaultValue: user?.email },
            { label: "Email" },
          )}
          {createInput(
            { name: "username", defaultValue: user?.username },
            { label: "Tài khoản" },
          )}
        </div>
        <div className="flex flex-col">
          {createSwitch(
            {
              name: "status",
              defaultChecked: user?.status === "banned" ? false : true,
            },
            { label: "Hoạt động" },
          )}
          {createInput(
            { name: "password", type: "password" },
            { label: "Mật khẩu" },
          )}
          {createInput(
            { name: "passwordConfirm", type: "password" },
            { label: "Nhập lại mật khẩu" },
          )}
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
                  defaultChecked={!!user?.roles.find((r) => r.roleId === p.id)}
                />
                <Label htmlFor={p.id} className="ml-2">
                  {p.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* {createInput({ name: "avatar", type: "file" }, { label: "Avartar" })} */}

      <input
        value={avatarId ?? ""}
        name="avatarId"
        className="hidden"
        onChange={() => {}}
      />
      <input
        value={avatarUrl ?? ""}
        name="avatarUrl"
        className="hidden"
        onChange={() => {}}
      />
      <Button type="submit">
        {user?.id ? "Sửa thông tin" : "Tạo tài khoản"}
      </Button>
    </fetcher.Form>
  );
};
