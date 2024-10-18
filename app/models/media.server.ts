import { Media } from "@prisma/client";
import { prisma } from "~/.server/db.server";

export const getMedias = async () =>
  await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
// Create Media
export const createMedia = async (data: Omit<Media, "id" | "createdAt">) => {
  return await prisma.media.create({
    data: data,
  });
};

// Get Media by ID
export const getMedia = async (id: string) => {
  return await prisma.media.findUnique({
    where: { id },
  });
};

// Update Media
export const updateMedia = async (
  id: string,
  data: Partial<Omit<Media, "id" | "createdAt">>,
) => {
  return await prisma.media.update({
    where: { id },
    data: data,
  });
};

// Delete Media
export const deleteMedia = async (id: string) => {
  return await prisma.media.delete({
    where: { id },
  });
};
