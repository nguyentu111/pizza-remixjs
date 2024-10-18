import { json, LoaderFunctionArgs } from "@remix-run/node";
import { UploadApiErrorResponse } from "cloudinary";
import { error } from "console";
import { upload } from "~/.server/cloudinary";
import { createMedia } from "~/models/media.server";

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[] | null; // Retrieve the file from the form data
  console.log(files);
  if (!files || files[0].size === 0) {
    return json(
      { error: "No file uploaded.", success: false },
      { status: 400 },
    );
  }
  await Promise.all(
    files.map(async (file) => {
      console.log("file type", file, file.type, file.name, file, { ...file });
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
}
export type UploadMediaActionResponse = { success: boolean; error: string };
