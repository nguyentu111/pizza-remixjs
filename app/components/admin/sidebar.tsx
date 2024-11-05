import { Form, NavLink } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { useStaff } from "~/hooks/use-staff";
import {
  LogOut,
  Users,
  Shield,
  UserCog,
  Pizza,
  ListOrdered,
  Tag,
  Box,
  Ruler,
  Cherry,
  Ticket,
  PackageSearch,
  ClipboardList,
  Store,
  Package,
  TruckIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useStaffRoles } from "~/hooks/use-staff-roles";

export default function Sidebar() {
  const staff = useStaff();
  const roles = useStaffRoles();

  return (
    <div className="bg-gray-100 h-full w-[250px] flex flex-col justify-between overflow-hidden">
      <nav className="max-h-full pb-[120px] overflow-y-auto pt-4">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/admin/staffs"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors whitespace-nowrap",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Nhân viên</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/providers"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <Store className="w-4 h-4" />
              <span>Nhà cung cấp</span>
            </NavLink>
          </li>
          {process.env.NODE_ENV === "development" && (
            <li>
              <NavLink
                to="/admin/permissions"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-2 transition-colors",
                    isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                  )
                }
              >
                <Shield className="w-4 h-4" />
                <span>Quyền hạn</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink
              to="/admin/roles"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <UserCog className="w-4 h-4" />
              <span>Vai trò</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <Pizza className="w-4 h-4" />
              <span>Sản phẩm</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <ListOrdered className="w-4 h-4" />
              <span>Danh mục</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/borders"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <Box className="w-4 h-4" />
              <span>Viền bánh</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/materials"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <Package className="w-4 h-4" />
              <span>Nguyên liệu</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/sizes"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <Ruler className="w-4 h-4" />
              <span>Kích thước</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/toppings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <Cherry className="w-4 h-4" />
              <span>Topping</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/coupons"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <Ticket className="w-4 h-4" />
              <span>Mã giảm giá</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/imports"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <PackageSearch className="w-4 h-4" />
              <span>Nhập hàng</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to={"/admin/orders"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 transition-colors",
                  isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                )
              }
            >
              <ClipboardList className="w-4 h-4" />
              <span>Đơn hàng</span>
            </NavLink>
          </li>
          {roles?.some((role) => role.name === "shipper") && (
            <>
              <li>
                <NavLink
                  to="/admin/ship/orders"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-4 py-2 transition-colors",
                      isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                    )
                  }
                >
                  <Package className="w-4 h-4" />
                  <span>Đơn hàng cần giao</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/ship/delivery"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-4 py-2 transition-colors",
                      isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200",
                    )
                  }
                >
                  <TruckIcon className="w-4 h-4" />
                  <span>Chuyến giao hàng</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="px-4 flex justify-between items-center sticky bottom-0 bg-white z-10 py-2 border-t">
        <div className="flex items-center gap-2 min-w-0">
          <img
            className="rounded-full w-10 h-10 flex-shrink-0"
            src={staff.image ?? ""}
            alt={staff.fullname}
          />
          <div className="flex flex-col min-w-0">
            <div className="font-bold capitalize truncate">
              {staff.fullname}
            </div>
            <div className="text-sm text-gray-500 truncate">
              Vai trò: {roles?.[0]?.name}
            </div>
          </div>
        </div>
        <Form action="/logout" method="post">
          <Button
            variant="ghost"
            type="submit"
            className="rounded hover:bg-gray-200"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </Form>
      </div>
    </div>
  );
}
