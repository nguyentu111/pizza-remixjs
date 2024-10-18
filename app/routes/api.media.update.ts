import { json, LoaderFunctionArgs } from "@remix-run/node";
import { updateMedia } from "~/models/media.server"; // Ensure this function is implemented

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get("id") as string;
  const caption = formData.get("caption") as string;
  const altText = formData.get("altText") as string;
  const description = formData.get("description") as string;

  try {
    await updateMedia(id, { caption, altText, description });
    return json({ success: true, error: null });
  } catch (error) {
    return json(
      { error: (error as Error).message, success: false },
      { status: 500 },
    );
  }
}
