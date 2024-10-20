import { useLoaderData } from "@remix-run/react";
import { UserTable } from "~/components/admin/user-table";
import { getAllUser, User } from "~/models/user.server";

export const loader = async () => {
  return {
    users: await getAllUser(),
  };
};
export default function UserManegeHome() {
  const { users } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="flex justify-between items-center mb-4  sticky top-4 bg-white ">
        <div>
          <h1 className="text-2xl font-bold">Quản lí tài khoản</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lí tài khoản
          </nav>
        </div>
      </div>
      <UserTable users={users as unknown as User[]} />
    </>
  );
}
