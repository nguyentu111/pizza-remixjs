import { prisma } from "~/lib/db.server";

export async function autoCancelOrders() {
  const autoCancelSetting = await prisma.settings.findFirst({
    where: { name: "autoCancelOrderAfter" },
  });

  if (!autoCancelSetting) return;

  const minutesAgo = new Date();
  minutesAgo.setMinutes(
    minutesAgo.getMinutes() - parseInt(autoCancelSetting.value),
  );

  await prisma.order.updateMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: minutesAgo,
      },
    },
    data: {
      status: "CANCELLED",
      cancelledReason: `Tự động hủy sau ${autoCancelSetting.value} phút không có người nhận đơn`,
    },
  });
}
