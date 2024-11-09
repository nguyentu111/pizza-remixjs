import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/lib/db.server";
import { pusher } from "~/lib/pusher.server";

interface PaymentCallbackData {
  token: string;
  payment: {
    transaction_id: string;
    amount: number;
    account_receiver: string;
    gate: string;
    content: string;
    date: string;
  };
}
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const data = (await request.json()) as PaymentCallbackData;

  // Validate payment token
  if (data.token !== process.env.PAYMENT_TOKEN) {
    console.log("invalid token");
    return json({ error: "Invalid token" }, { status: 401 });
  }

  const payment = data.payment;

  // Find payment record by transaction content (which contains the payment code)
  const paymentRecord = await prisma.payment.findFirst({
    where: {
      code: {
        equals: payment.content.match(/\b[A-Z0-9]{10}\b/)?.[0] || "",
      },
      status: "UNPAID",
    },
    include: {
      order: true,
    },
  });

  if (!paymentRecord) {
    return json({ error: "Payment not found" }, { status: 404 });
  }

  // Validate amount
  if (Number(payment.amount) !== Number(paymentRecord.order.totalAmount)) {
    return json({ error: "Invalid amount" }, { status: 400 });
  }

  // Update payment and order status
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: "PAID",
        transaction_id: payment.transaction_id,
        content: payment.content,
        date: new Date(payment.date),
        gateway: payment.gate,
        account_receiver: payment.account_receiver,
        amount: Number(payment.amount),
      },
    }),
    prisma.order.update({
      where: { id: paymentRecord.order_id },
      data: {
        paymentStatus: "PAID",
      },
    }),
  ]);

  // Trigger Pusher event
  await pusher.trigger(`payment-${paymentRecord.code}`, "payment-completed", {
    status: "PAID",
  });

  return json({ success: true });
}
