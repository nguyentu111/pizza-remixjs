import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { CustomerTable } from "~/components/admin/customer-table";
import { getAllCustomers } from "~/models/customer.server";

export const loader = async () => {
  const customers = await getAllCustomers();
  return json({ customers });
};

export default function CustomerManagement() {
  const { customers } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lý khách hàng
          </nav>
        </div>
      </div>
      <CustomerTable customers={customers as any} />
      <Outlet />
    </div>
  );
}
