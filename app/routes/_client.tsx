import { LoaderFunctionArgs } from "@remix-run/node";
import { json, Outlet } from "@remix-run/react";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";
import { CartProvider } from "~/components/providers/cart-provider";
import { ModalProvider } from "~/components/providers/modal-provider";
import { prisma } from "~/lib/db.server";
import { getCustomer } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const customer = await getCustomer(prisma, request);
  return json({ customer });
};

export default function ClientLayout() {
  return (
    <CartProvider>
      <ModalProvider>
        <div className="h-full overflow-auto">
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-[68px]">
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      </ModalProvider>
    </CartProvider>
  );
}
