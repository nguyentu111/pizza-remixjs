import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet } from "@remix-run/react";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import { prisma } from "~/lib/db.server";
import { getCustomer } from "~/session.server";
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const customer = await getCustomer(prisma, request);
  return json({ customer });
};
export default function ClientLayout() {
  return (
    <div>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
