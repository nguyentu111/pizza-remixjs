import { Coupon } from "@prisma/client";
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { AddressSearch } from "~/components/home/AddressSearch";
import { Banner } from "~/components/home/Banner";
import { ProductSection } from "~/components/home/ProductSection";
import { ProductSectionProps } from "~/lib/type";
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
  const { couponsWithBanners, products, tab } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Banner couponsWithBanners={couponsWithBanners as unknown as Coupon[]} />
      <AddressSearch />
      <ProductSection
        products={products as unknown as ProductSectionProps["products"]}
      />
    </>
  );
}
