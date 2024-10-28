import type { Prisma, Coupon } from "@prisma/client";
import { prisma } from "~/lib/db.server";

export async function getAllCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCouponById(id: Coupon["id"]) {
  return prisma.coupon.findUnique({
    where: { id },
  });
}

export async function getCouponByCode(code: Coupon["code"]) {
  return prisma.coupon.findUnique({
    where: { code },
  });
}

export async function createCoupon(data: Prisma.CouponCreateInput) {
  return prisma.coupon.create({
    data,
  });
}

export async function updateCoupon(
  id: Coupon["id"],
  data: Prisma.CouponUpdateInput,
) {
  return prisma.coupon.update({
    where: { id },
    data,
  });
}

export async function deleteCoupon(id: Coupon["id"]) {
  return prisma.coupon.delete({
    where: { id },
  });
}
