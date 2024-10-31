import { NavLink } from "@remix-run/react";

import { Outlet } from "@remix-run/react";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex space-x-4 mb-6">
        <NavLink to="/account" className="text-blue-500 hover:text-blue-800">
          Thông Tin Cá Nhân
        </NavLink>
        <NavLink
          to="/account/change-password"
          className="text-blue-500 hover:text-blue-800"
        >
          Thay Đổi Mật Khẩu
        </NavLink>
        <NavLink
          to="/account/order-history"
          className="text-blue-500 hover:text-blue-800"
        >
          Đơn Đã Đặt Hàng
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
