import { ActionFunction, json } from "@remix-run/node";
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

export const loader = async () => {
  const permissions = await getAllPermissions(prisma);
  return json(permissions);
};
const addPermissionSchema = z.object({
  name: z.string().min(1),
  description: z.optional(z.string()),
});
export const action: ActionFunction = safeAction([
  {
    action: ca(async ({}, { name, description }) => {
      await createPermission({ name, description });
      return json({
        success: true,
      });
    }),
    method: "POST",
    schema: addPermissionSchema,
  },
  {
    method: "DELETE",
    action: async ({ request }) => {
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
  const { createInput, fetcher, formRef, actionData, ErrorMessage } =
    useForm<typeof addPermissionSchema>();
  const fetcherDelete = useFetcher<{ error: null | string }>();

  return (
    <div>
      <fetcher.Form ref={formRef} method="post" action="/admin/permissions">
        {createInput(
          { name: "name", placeholder: "Permission name" },
          { label: "Name" },
        )}
        {createInput(
          { name: "description", placeholder: "Permission description" },
          { label: "Description" },
        )}

        <ErrorMessage />
        <Button type="submit">Add Permission</Button>
      </fetcher.Form>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission) => (
            <tr key={permission.id}>
              <td>{permission.name}</td>
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
