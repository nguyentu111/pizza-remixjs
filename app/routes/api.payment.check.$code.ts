import { LoaderFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/lib/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const code = params.code;

  if (!code) {
    return json({ error: "Payment code is required" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: {
      code: code,
    },
    select: {
      status: true,
    },
  });

  if (!payment) {
    return json({ error: "Payment not found" }, { status: 404 });
  }

  return json({
    status: payment.status,
  });
}
