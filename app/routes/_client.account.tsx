import { Form, NavLink, Outlet } from "@remix-run/react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";

export default function AccountPage() {
  const navItems = [
    { to: "/account", label: "Thông Tin Cá Nhân" },
    { to: "/account/change-password", label: "Thay Đổi Mật Khẩu" },
    { to: "/account/order-history", label: "Đơn Đã Đặt Hàng" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 pt-16 min-h-[80vh]"
    >
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-4 mb-6"
      >
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <NavLink
              end={item.to === "/account"}
              to={item.to}
              className={({ isActive }) =>
                `text-blue-500 hover:text-blue-800 transition-colors ${
                  isActive ? "font-bold" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          </motion.div>
        ))}
        <Form method="post" action="/logout">
          <motion.div
            key="logout"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + navItems.length * 0.1 }}
          >
            <button
              type="submit"
              className="text-blue-500 hover:text-blue-800 transition-colors p-0 h-fit hover:no-underline font-normal text-base"
            >
              Đăng Xuất
            </button>
          </motion.div>
        </Form>
      </motion.nav>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Outlet />
      </motion.div>
    </motion.div>
  );
}
