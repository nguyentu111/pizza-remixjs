import { Media } from "@prisma/client";
import {
  ActionFunction,
  ActionFunctionArgs,
  json,
  LoaderFunction,
} from "@remix-run/node";
import { error } from "console";
import { deleteResource, upload } from "~/.server/cloudinary";
import {
  createMedia,
  deleteMedia,
  getAllMedia,
  getMedia,
  updateMedia,
} from "~/models/media.server";

export const updateMediaAction = async (
  data: Pick<Media, "id" | "altText" | "description" | "caption">,
) => {
  const { id, caption, altText, description } = data;
  try {
    await updateMedia(id, { caption, altText, description });
    return json({ success: true, error: null });
  } catch (error) {
    return json(
      { error: (error as Error).message, success: false },
      { status: 500 },
    );
  }
};
export const uploadMedia = async (formData: FormData) => {
  const files = formData.getAll("files") as File[] | null; // Retrieve the file from the form data
  if (!files || files.length === 0 || files[0]?.size === 0) {
    return json(
      { error: "No file uploaded.", success: false },
      { status: 400 },
    );
  }
  await Promise.all(
    files.map(async (file) => {
      const fileData = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileData);
      try {
        const rs = await upload(fileBuffer);
        if (rs.secure_url)
          await createMedia({
            bytes: rs.bytes,
            displayName: file.name,
            height: rs.height,
            publicId: rs.public_id,
            resourceType: rs.resource_type,
            url: rs.url,
            width: rs.width,
            format: file.name.split(".").pop() ?? rs.format,
            altText: file.name,
            caption: null,
            description: null,
          });
      } catch (error) {
        console.log(error);
        return json(
          { error: (error as Error).message, success: false },
          { status: 500 },
        );
      }
    }),
  );
  return json({ success: true, error: null }, { status: 200 });
};
export const deleteMediaAction = async (
  request: ActionFunctionArgs["request"],
) => {
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
    const result = await deleteResource(media.publicId, media.resourceType);
    if (result.result === "ok") await deleteMedia(media.id);
    else throw new Error(result.result);
    return json({ success: true, error: null }, { status: 200 });
  } catch (error) {
    console.log(error);
    return json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
};
