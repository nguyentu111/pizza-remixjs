import { LoaderFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/lib/db.server";
import { getProductById } from "~/models/product.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id as string;
  const product = await getProductById(prisma, id);
  if (!product) throw new Error("Product not found");
  return json({ product });
};
