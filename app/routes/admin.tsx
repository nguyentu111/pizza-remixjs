import { Media, User } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { getAllMedia, updateMedia } from "~/models/media.server";
import { requireUser } from "~/session.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const method = request.method;
  const values = Object.fromEntries(formData) as { [key: string]: any };
  if (values._action === "update-media") {
    const { id, caption, altText, description } = values;
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

  return null;
};
export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const media = await getAllMedia();
  return json({ user, media }, { status: 200 });
};
export type AdminLayoutData = { user: User; media: Media[] };
export default function AdminLayout() {
  return (
    <div className="flex h-full">
      <div className="bg-gray-100 h-full min-w-[400px]">Side bar</div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
