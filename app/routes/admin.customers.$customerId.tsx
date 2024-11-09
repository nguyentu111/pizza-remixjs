import { Customer } from "@prisma/client";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/lib/db.server";
import { safeAction } from "~/lib/utils";
import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
  updatePassword,
} from "~/models/customer.server";
import { requireStaff } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { PermissionsEnum } from "~/lib/type";

// Schema for customer updates
const updateCustomerSchema = z
  .object({
    fullname: z.string().min(1, "Họ tên không được để trống"),
    phoneNumbers: z.string().min(10, "Số điện thoại không hợp lệ"),
    status: z.enum(["on", "banned"]),
    avatarUrl: z.string().optional(),
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.passwordConfirm) {
        return data.password === data.passwordConfirm;
      }
      return true;
    },
    {
      message: "Mật khẩu xác nhận không khớp",
      path: ["passwordConfirm"],
    },
  );

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.customerId;
  const customer = await getCustomerById(prisma, id as string);
  if (!customer) return redirect("/admin/customers");
  return json({ customer });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: updateCustomerSchema,
    action: async ({ request, params }, data) => {
      const currentUser = await requireStaff(prisma, request);
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

        if (validatedData.password && validatedData.passwordConfirm) {
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
      if (!id) return json({ success: false, error: "missing id." }, 400);
      await deleteCustomer(id);
      return json({ success: true });
    },
  },
]);

export default function EditCustomerPage() {
  const { customer } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">
        Chỉnh sửa thông tin khách hàng
      </h2>
      <form method="POST" action="?index">
        <input type="hidden" name="_method" value="PUT" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ tên</label>
            <input
              type="text"
              name="fullname"
              defaultValue={customer.fullname}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              name="phoneNumbers"
              defaultValue={customer.phoneNumbers}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              name="status"
              defaultValue={customer.status}
              className="w-full p-2 border rounded"
            >
              <option value="on">Hoạt động</option>
              <option value="banned">Khóa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Đổi mật khẩu (để trống nếu không đổi)
            </label>
            <input
              type="password"
              name="password"
              className="w-full p-2 border rounded mb-2"
              placeholder="Mật khẩu mới"
            />
            <input
              type="password"
              name="passwordConfirm"
              className="w-full p-2 border rounded"
              placeholder="Xác nhận mật khẩu mới"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
