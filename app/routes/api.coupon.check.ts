import { json, LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/lib/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return json({ error: "Missing coupon code" }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code },
  });

  if (!coupon) {
    return json({ error: "Mã giảm giá không tồn tại" }, { status: 404 });
  }

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    return json({ error: "Mã giảm giá đã hết hạn" }, { status: 400 });
  }

  if (coupon.quantity <= 0) {
    return json({ error: "Mã giảm giá đã hết lượt sử dụng" }, { status: 400 });
  }

  return json({ coupon });
};
