import { Customer } from "@prisma/client";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { AddOrUpdateCustomerForm } from "~/components/admin/add-or-update-customer-form";
import { ErrorBoundary } from "~/components/shared/error-boudary";
import { prisma } from "~/lib/db.server";
import { updateCustomerSchema } from "~/lib/schema";
import { PermissionsEnum } from "~/lib/type";
import { safeAction } from "~/lib/utils";
import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
  updatePassword,
} from "~/models/customer.server";
import { requireStaff } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export { ErrorBoundary };

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.customerId;
  const customer = await getCustomerById(prisma, id as string);
  if (!customer) return redirect("/notfound");
  return json({ customer });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: updateCustomerSchema,
    action: async ({ request, params }, data) => {
      const currentUser = await requireStaff(prisma, request);
      await requirePermissions(prisma, currentUser.id, [
        PermissionsEnum.UpdateCustomers,
      ]);
      const validatedData = data as z.infer<typeof updateCustomerSchema>;
      const id = params.customerId as string;

      return await prisma.$transaction(async (db) => {
        const customer = await getCustomerById(db, id);
        if (!customer) {
          return json(
            { success: false, error: "Không tìm thấy khách hàng." },
            { status: 404 },
          );
        }

        if (validatedData.status === "banned") {
          await requirePermissions(db, currentUser.id, [
            PermissionsEnum.BanCustomers,
          ]);
        }

        await updateCustomer(db, id, {
          fullname: validatedData.fullname,
          phoneNumbers: validatedData.phoneNumbers,
          status: validatedData.status,
          avatarUrl: validatedData.avatarUrl,
        });

        if (validatedData.password) {
          await updatePassword(db, customer.id, validatedData.password);
        }

        return json({ success: true });
      });
    },
  },
  {
    method: "DELETE",
    action: async ({ request, params }) => {
      const user = await requireStaff(prisma, request);
      await requirePermissions(prisma, user.id, [
        PermissionsEnum.DeleteCustomers,
      ]);
      const id = params.customerId as string;
      if (!id) return json({ success: false, error: "Missing ID." }, 400);
      await deleteCustomer(id);
      return json({ success: true });
    },
  },
]);

export default function EditCustomerPage() {
  const { customer } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Sửa thông tin khách hàng</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt;{" "}
            <a href="/admin/customers" className="hover:underline">
              Quản lí khách hàng
            </a>{" "}
            &gt; Sửa thông tin khách hàng
          </nav>
        </div>
      </div>
      <div className="py-10">
        <AddOrUpdateCustomerForm customer={customer as any} />
      </div>
    </>
  );
}
