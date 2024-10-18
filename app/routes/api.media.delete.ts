import { json, LoaderFunctionArgs } from "@remix-run/node";
import { deleteResource, upload } from "~/.server/cloudinary";
import { deleteMedia, getMedia } from "~/models/media.server";

export async function action({ request, params }: LoaderFunctionArgs) {
  if (request.method === "delete" || request.method === "DELETE") {
    try {
      const url = new URL(request.url);
      const imageId = url.searchParams.get("id");
      if (!imageId)
        return json(
          { success: false, error: "Missing image id" },
          { status: 400 },
        );
      const media = await getMedia(imageId);
      if (!media)
        return json(
          { success: false, error: "Media not found" },
          { status: 404 },
        );
      const result = await deleteResource(media.publicId);
      if (result.result === "ok") await deleteMedia(media.id);
      else throw new Error(result.result);
    } catch (error) {
      console.log(error);
      return json(
        { success: false, error: (error as Error).message },
        { status: 500 },
      );
    }
    return json({ success: true, error: null });
  }
  return null;
}
export type DeleteMediaActionResponse = Awaited<ReturnType<typeof action>>;
