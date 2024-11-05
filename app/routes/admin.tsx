import { Media, Staff } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, Outlet, ShouldRevalidateFunction } from "@remix-run/react";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import {
  deleteMediaAction,
  updateMediaAction,
  uploadMedia,
} from "~/use-cases/media.server";
import { Button } from "~/components/ui/button";
import { PermissionsEnum } from "~/lib/type";
import { prisma } from "~/lib/db.server";
import { ca, cn } from "~/lib/utils";
import { getAllMedia } from "~/models/media.server";
import { requireStaff } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";
import { getUserPermission } from "~/models/permission.server";
import Sidebar from "~/components/admin/sidebar";
import { getStaffRoles } from "~/models/role.server";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const action: ActionFunction = ca(async ({ request }) => {
  const user = await requireStaff(prisma, request);
  const formData = await request.formData();
  const method = request.method;
  const values = Object.fromEntries(formData) as any;
  if (method === "POST") {
    if (values._action === "update-media") {
      await requirePermissions(prisma, user.id, [PermissionsEnum.UpdateMedia]);
      return updateMediaAction(values);
    }
    if (values._action === "upload-media") {
      await requirePermissions(prisma, user.id, [PermissionsEnum.UpLoadMedia]);
      return uploadMedia(formData);
    }
  }
  if (method === "DELETE") {
    if (values._action === "delete-media") {
      await requirePermissions(prisma, user.id, [PermissionsEnum.DeleteMedia]);
      return deleteMediaAction(request);
    }
  }
  return null;
});
export const loader: LoaderFunction = async ({ request }) => {
  const [staff, media] = await Promise.all([
    requireStaff(prisma, request),
    getAllMedia(),
  ]);
  const permissions = await getUserPermission(prisma, staff.id);
  const roles = await getStaffRoles(prisma, staff.id);
  return json({ staff, media, permissions, roles }, { status: 200 });
};
export type AdminLayoutData = { staff: Staff; media: Media[] };
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  formData,
}) => {
  const _action = formData?.get("_action");
  return (
    _action === "upload-media" ||
    _action === "delete-media" ||
    !!formAction?.startsWith("/admin/staffs")
  );
};
export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) {
      setIsSidebarOpen(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="flex h-full relative">
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full relative"
          >
            <Sidebar />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white shadow-md rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 transition-all duration-300 relative`}>
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="fixed left-0 top-0 bottom-0 z-50 bg-gray-300 hover:bg-gray-500 w-[20px] h-screen shadow-md rounded-none"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        <div
          className={cn(
            "p-4 w-full max-h-screen overflow-auto",
            !isSidebarOpen && "pl-8",
          )}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
