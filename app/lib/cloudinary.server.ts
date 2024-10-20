import { CLOUD_FOLDER } from "./config.server";
import {
  v2 as cloudinary,
  DeleteApiResponse,
  ResourceApiResponse,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, // Your Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // Your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Your Cloudinary API secret
});
export const getResources = (): Promise<ResourceApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.api.resources(
      {
        type: "upload",
        prefix: CLOUD_FOLDER,
        max_results: 500, // Adjust as needed
      },
      (error: Error, result: ResourceApiResponse) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
  });
};

export const upload = async (file: Buffer) => {
  const result: UploadApiResponse | UploadApiErrorResponse | undefined =
    await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "auto", folder: CLOUD_FOLDER },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(file); // Upload the file stream
    });
  if (!result || !result.url) throw new Error("Upload failed.");
  return result;
};
export const deleteResource = async (
  publicId: string,
  resource_type: "image" | "video" | "raw" = "image",
) => {
  return (await cloudinary.uploader.destroy(publicId, { resource_type })) as {
    result: string;
  };
};
