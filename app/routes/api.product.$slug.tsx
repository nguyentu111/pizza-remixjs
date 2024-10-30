import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getProductBySlug } from "~/models/product.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;
  if (!slug) throw new Error("Slug is required");

  const product = await getProductBySlug(slug);
  if (!product) throw new Error("Product not found");

  return json({ product });
};
