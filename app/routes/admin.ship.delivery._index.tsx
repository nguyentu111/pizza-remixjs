import { DeliveryTable } from "~/components/admin/delivery-table";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getDeliveries } from "~/models/delivery.server";

export async function loader() {
  const deliveries = await getDeliveries();

  return json({ deliveries });
}

export default function DeliveryRoutes() {
  const { deliveries } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Chuyến giao hàng</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Chuyến giao hàng
          </nav>
        </div>
      </div>
      <DeliveryTable
        deliveries={
          deliveries as unknown as Awaited<ReturnType<typeof getDeliveries>>
        }
      />
    </>
  );
}
