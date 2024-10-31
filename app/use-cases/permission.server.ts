import { Permission, Prisma, Staff } from "@prisma/client";
import { getUserPermission } from "~/models/permission.server";
import * as _ from "lodash";
import { CustomHttpError, ERROR_NAME } from "~/lib/error";
import { PermissionsEnum } from "~/lib/type";
import { getStaff } from "~/session.server";
import { getStaffById } from "~/models/staff.server";

/**
 * return array of permisson names that not exist in required permissons
 * @param db
 * @param userId
 * @param requirePermissions
 * @returns string[]
 */
export const userMissingPermissions = async (
  db: Prisma.TransactionClient,
  userId: Staff["id"], // User ID
  requirePermissions: string[], // Array of permission names to check
) => {
  const userPermissions = await getUserPermission(db, userId);
  const userPermissionNames = userPermissions.map((p) => p.name);
  return _.difference(requirePermissions, userPermissionNames);
};
export const requirePermissions = async (
  db: Prisma.TransactionClient,
  userid: Staff["id"],
  permissionNames: PermissionsEnum[],
) => {
  const user = await getStaffById(db, userid);
  if (!user)
    throw new CustomHttpError({
      message: "Tài khoản không tồn tại",
      name: ERROR_NAME.NOT_FOUND,
      statusCode: 404,
    });
  if (
    user.username === "admin" &&
    process.env.ALLOW_ADMIN_FULL_ACCESS === "true"
  )
    return;
  const missingPermissons = await userMissingPermissions(
    db,
    userid,
    permissionNames,
  );
  if (missingPermissons.length > 0)
    throw new CustomHttpError({
      message:
        process.env.SHOW_PERMISSION_MISSING === "true"
          ? "Tài khoản của bạn thiếu các quyền sau: " +
            missingPermissons.reduce(
              (acc, curr, i) =>
                (acc +=
                  i === missingPermissons.length - 1 ? `${curr}` : `${curr}, `),
              "",
            ) +
            "."
          : "Tài khoản của bạn không có quyền thực thi yêu cầu này.",
      name: ERROR_NAME.MISSING_PERMISSIONS,
      statusCode: 403,
    });
};
// export async function safeGet<T extends any[], R>(
//   db: Prisma.TransactionClient,
//   userId: Staff["id"],
//   getter: (...args: T) => R,
//   permissions: PermissionsEnum[],
// ) {
//   try {
//     await requirePermissions(db, userId, permissions);
//     return await getter(...getter.arguments);
//   } catch (error) {
//     console.log((error as Error).message);
//     return null;
//   }
// }
