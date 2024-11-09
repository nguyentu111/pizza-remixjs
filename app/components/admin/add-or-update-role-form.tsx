import { Permission, Role, RolePermission } from "@prisma/client";
import { groupBy } from "lodash";
import { useFetcher } from "@remix-run/react";
import { useToast } from "~/hooks/use-toast";
import { useRef, useState } from "react";
import { ErrorMessage } from "../shared/form/error-message";
import { InputField } from "../shared/form/form-fields/input-field";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { JsonObject } from "@prisma/client/runtime/library";

export const AddOrUpdateRoleForm = ({
  permissions,
  role,
}: {
  role?: Role & { permissions: RolePermission[] } & { id?: Role["id"] };
  permissions: Permission[];
}) => {
  const { toast } = useToast();
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions.map((r) => r.permissionId) || [],
  );

  const groupedPermissions = groupBy(permissions, "group") as {
    [key: string]: Permission[];
  };

  const handleSelectAllGroup = (group: string, checked: boolean) => {
    const groupPermissionIds = groupedPermissions[group].map((p) => p.id);

    setSelectedPermissions((prev) => {
      const newSelected = new Set(prev);

      if (checked) {
        groupPermissionIds.forEach((id) => newSelected.add(id));
      } else {
        groupPermissionIds.forEach((id) => newSelected.delete(id));
      }

      return Array.from(newSelected);
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => {
      if (checked) {
        return [...prev, permissionId];
      }
      return prev.filter((id) => id !== permissionId);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const jsonData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      "permissions[]": selectedPermissions,
    };

    fetcher.submit(jsonData, {
      action: role?.id ? `/admin/roles/${role.id}` : "/admin/roles/add",
      method: role?.id ? "PUT" : "POST",
      encType: "application/json",
    });
  };
  console.log(fetcher.data);
  // if (fetcher.data?.) {
  //   toast({
  //     title: role?.id ? "Sửa vai trò thành công" : "Thêm vai trò thành công",
  //     description: "",
  //   });
  // }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{role?.id ? "Sửa vai trò" : "Thêm vai trò"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Tên vai trò</Label>
              <InputField
                name="name"
                defaultValue={role?.name}
                className="w-full"
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <InputField
                name="description"
                defaultValue={role?.description || ""}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Phân quyền</Label>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div key={group} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={perms.every((p) =>
                          selectedPermissions.includes(p.id),
                        )}
                        onCheckedChange={(checked) =>
                          handleSelectAllGroup(group, checked as boolean)
                        }
                      />
                      <Label className="text-base font-medium">{group}</Label>
                    </div>
                    <div className="ml-6 space-y-2">
                      {perms.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(
                              permission.id,
                            )}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                permission.id,
                                checked as boolean,
                              )
                            }
                          />
                          <Label htmlFor={permission.id}>
                            {permission.displayName}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={fetcher.state === "submitting"}>
              {fetcher.state === "submitting"
                ? "Đang xử lý..."
                : role?.id
                  ? "Cập nhật vai trò"
                  : "Thêm vai trò"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
