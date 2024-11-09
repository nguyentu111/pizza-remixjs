import { Coupon } from "@prisma/client";
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { AddressSearch } from "~/components/home/address-bar";
import { Banner } from "~/components/home/banner";
import { ProductSection } from "~/components/home/product-section";
import { ProductWithDetails } from "~/lib/type";
import { getAllCoupons } from "~/models/coupon.server";
import {
  getRandomProducts,
  getBestSellerProducts,
} from "~/models/product.server";

export const meta: MetaFunction = () => [{ title: "Domino's Pizza Vietnam" }];
export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") || "whatToEat";

  const [coupons, products] = await Promise.all([
    getAllCoupons(),
    tab === "bestSellers" ? getBestSellerProducts(4) : getRandomProducts(4),
  ]);
  const couponsWithBanners = coupons.filter((coupon) => coupon.bannerImage);
  return { couponsWithBanners, products, tab };
};

export default function Index() {
  const { couponsWithBanners, products } = useLoaderData<typeof loader>();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Banner couponsWithBanners={couponsWithBanners as unknown as Coupon[]} />
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <AddressSearch />
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <ProductSection
          products={products as unknown as ProductWithDetails[]}
        />
      </motion.div>
    </motion.div>
  );
}
