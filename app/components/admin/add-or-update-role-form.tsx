import { Permission, Role, RolePermission } from "@prisma/client";
import { z } from "zod";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { Button } from "../ui/button";
import { roleSchema } from "~/lib/schema";
import { groupBy } from "lodash";
import { FormField } from "../shared/form/form-field";
import { Label } from "../ui/label";
import { InputField } from "../shared/form/form-items/input-field";
import { CheckboxesGroupField } from "../shared/form/form-items/checkboxes-group-field";
import { ErrorMessage } from "../shared/form/error-message";
import React from "react";
export const AddOrUpdateRoleForm = ({
  permissions,
  role,
}: {
  role?: Role & { permissions: RolePermission[] } & { id?: Role["id"] };
  permissions: Permission[];
}) => {
  const { toast } = useToast();
  const { fetcher, formRef, control } = useForm<typeof roleSchema>({
    onSuccess() {
      toast({
        title: role?.id ? "Sửa vai trò thành công" : "Thêm vai trò thành công",
        description: "",
      });
    },
    defaultValues: {
      name: role?.name,
      description: role?.description ?? undefined,
      "permissions[]": role?.permissions.map((r) => r.permissionId),
    },
  });
  const groupedPermissions = groupBy(permissions, "group") as unknown as {
    [key: string]: Permission[];
  };

  return (
    <fetcher.Form
      action={role?.id ? "/admin/roles/" + role.id : "/admin/roles/add"}
      method={role?.id ? "PUT" : "POST"}
      ref={formRef}
    >
      <FormField control={control} name={"name"}>
        <Label>Tên vai trò</Label>
        <InputField />
        <ErrorMessage />
      </FormField>
      <FormField control={control} name={"description"}>
        <Label>Mô tả</Label>
        <InputField />
        <ErrorMessage />
      </FormField>

      <FormField control={control} name="permissions[]">
        {Object.keys(groupedPermissions).map((group) => (
          <React.Fragment key={group}>
            <Label>{group}</Label>
            <CheckboxesGroupField
              checkboxes={groupedPermissions[group].map((permission) => ({
                label: permission.displayName,
                value: permission.id,
                defaultChecked: role?.permissions.some(
                  (r) => r.permissionId === permission.id,
                ),
              }))}
            />
          </React.Fragment>
        ))}
        <ErrorMessage />
      </FormField>
      <Button type="submit">{role?.id ? "Sửa vai trò" : "Thêm vai trò"}</Button>
    </fetcher.Form>
  );
};
