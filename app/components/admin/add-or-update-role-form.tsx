import { Permission, Role, RolePermission } from "@prisma/client";
import { z } from "zod";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { Button } from "../ui/button";
import { roleSchema } from "~/lib/schema";

export const AddOrUpdateRoleForm = ({
  permissions,
  role,
}: {
  role?: Role & { permissions: RolePermission[] } & { id?: Role["id"] };
  permissions: Permission[];
}) => {
  const { toast } = useToast();
  const { fetcher, formRef, createInput, ErrorMessage, createCheckboxes } =
    useForm<typeof roleSchema>({
      onSuccess() {
        toast({
          title: role?.id ? "Sửa quyền thành công" : "Thêm quyền thành công",
          description: "",
        });
      },
    });
  console.log(role);
  return (
    <fetcher.Form
      action={role?.id ? "/admin/roles/" + role.id : "/admin/roles"}
      method={role?.id ? "PUT" : "POST"}
      ref={formRef}
    >
      {createInput(
        { name: "name", defaultValue: role?.name },
        { label: "Name" },
      )}
      {createInput(
        { name: "description", defaultValue: role?.description ?? undefined },
        { label: "Description" },
      )}
      {createCheckboxes(
        permissions.map((p) => ({
          label: p.name,
          value: p.id,
          name: "permissions[]",
          defaultChecked: !!role?.permissions.find(
            (permission) => permission.permissionId === p.id,
          ),
        })),
        { topLabel: "Cho phép" },
      )}
      <Button type="submit">{role?.id ? "Sửa quyền" : "Thêm quyền"}</Button>
    </fetcher.Form>
  );
};
