import { LoaderFunctionArgs } from "@remix-run/node";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { getAllMedia } from "~/models/media.server";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireStaffId(request);
  await requirePermissions(prisma, userId, [PermissionsEnum.ViewMedia]);
  const media = await getAllMedia();
  return { media };
};
