import { json, Outlet } from "@remix-run/react";
import { z } from "zod";
import { ca, safeAction } from "~/lib/utils";
import { createRole, getRoleByName } from "~/models/role.server";
export const insertSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  "permissions[]": z.array(z.string(), {
    message: "Vui lòng chọn ít nhất 1 quyền",
  }),
});
export const action = safeAction([
  {
    method: "POST",
    action: ca(async ({ request }, data) => {
      const exist = await getRoleByName(data.name);
      if (exist)
        return json(
          { error: "Role with that name already exist.", success: false },
          { status: 400 },
        );

      await createRole({
        name: data.name,
        description: data.description,
        permissionIds: data["permissions[]"],
      });
      return json({
        success: true,
      });
    }),
    schema: insertSchema,
  },
]);
export default function RoleLayout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
}
