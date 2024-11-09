import { ActionFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { prisma } from "~/lib/db.server";
import { requireCustomer } from "~/session.server";

const ratingSchema = z.object({
  orderId: z.string(),
  stars: z.string().transform(Number),
  description: z.string().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const customer = await requireCustomer(prisma, request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const validatedData = ratingSchema.parse(data);

    // Verify order belongs to customer
    const order = await prisma.order.findFirst({
      where: {
        id: validatedData.orderId,
        customerId: customer.id,
        status: "COMPLETED",
        rating: null,
      },
    });

    if (!order) {
      return json(
        { error: "Order not found or already rated" },
        { status: 404 },
      );
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        stars: validatedData.stars,
        description: validatedData.description,
        orderId: validatedData.orderId,
      },
    });

    return json({ success: true, rating });
  } catch (error) {
    return json({ error: "Invalid data" }, { status: 400 });
  }
}
