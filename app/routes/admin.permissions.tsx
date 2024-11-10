import { ActionFunction, json, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Table } from "~/components/ui/table";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { useForm } from "~/hooks/use-form";
import { ca, safeAction } from "~/lib/utils";
import {
  createPermission,
  deletePermission,
  getAllPermissions,
} from "~/models/permission.server";
import { prisma } from "~/lib/db.server";
import { FormField } from "~/components/shared/form/form-field";
import { Label } from "~/components/ui/label";
import { InputField } from "~/components/shared/form/form-fields/input-field";
import { PermissionsEnum } from "~/lib/type";
import { requirePermissions } from "~/use-cases/permission.server";
import { requireStaffId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const currentUserId = await requireStaffId(request);
  await requirePermissions(prisma, currentUserId, [
    PermissionsEnum.ViewPermissions,
  ]);
  const permissions = await getAllPermissions(prisma);
  return json(permissions);
};
const addPermissionSchema = z.object({
  name: z.string().min(1),
  group: z.string().min(1),
  description: z.optional(z.string()),
  displayName: z.string().min(1),
});
export const action: ActionFunction = safeAction([
  {
    action: async ({ request }, { name, description, displayName, group }) => {
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.CreatePermissions,
      ]);
      await createPermission({ name, description, displayName, group });
      return json({
        success: true,
      });
    },
    method: "POST",
    schema: addPermissionSchema,
  },
  {
    method: "DELETE",
    action: async ({ request }) => {
      const currentUserId = await requireStaffId(request);
      await requirePermissions(prisma, currentUserId, [
        PermissionsEnum.DeletePermissions,
      ]);
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      const id = searchParams.get("id");
      if (!id) return json({ success: false, error: "missing id." }, 400);
      await deletePermission(id);
      return json({ success: true });
    },
  },
]);

export default function PermissionManagement() {
  const permissions = useLoaderData<typeof loader>();
  const { fetcher, formRef, control } = useForm<typeof addPermissionSchema>({});
  const fetcherDelete = useFetcher<{ error: null | string }>();

  return (
    <div>
      <fetcher.Form ref={formRef} method="post" action="/admin/permissions">
        <FormField control={control} name={"name"}>
          <Label>Name</Label>
          <InputField />
        </FormField>
        <FormField control={control} name={"displayName"}>
          <Label>displayName</Label>
          <InputField />
        </FormField>
        <FormField control={control} name={"group"}>
          <Label>Nhóm</Label>
          <InputField />
        </FormField>
        <FormField control={control} name={"description"}>
          <Label>Permission description</Label>
          <InputField />
        </FormField>

        <Button type="submit">Add Permission</Button>
      </fetcher.Form>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Display Name</th>
            <th>Group</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td>{permission.name}</td>
              <td>{permission.displayName}</td>
              <td>{permission.group}</td>
              <td>{permission.description}</td>
              <td>
                <fetcherDelete.Form
                  action={`/admin/permissions?id=${permission.id}`}
                  method="DELETE"
                >
                  <Button variant={"destructive-outline"}>Delete</Button>
                  {fetcherDelete.data?.error}
                </fetcherDelete.Form>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
