import { Form, NavLink, useLocation } from "@remix-run/react";
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
  Boxes,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "../ui/button";
import { useStaffRoles } from "~/hooks/use-staff-roles";
import { PermissionsEnum } from "~/lib/type";
import { useStaffPermissions } from "~/hooks/use-staff-permissions";

const adminRoutes = [
  {
    path: "/admin",
    icon: LayoutDashboard,
    label: "Tổng quan",
    requiredPermissions: [PermissionsEnum.ViewDashboard],
  },
  {
    path: "/admin/customers",
    icon: Users,
    label: "Khách hàng",
    requiredPermissions: [PermissionsEnum.ViewCustomers],
  },
  {
    path: "/admin/staffs",
    icon: Users,
    label: "Nhân viên",
    requiredPermissions: [PermissionsEnum.ViewStaffs],
  },
  {
    path: "/admin/providers",
    icon: Store,
    label: "Nhà cung cấp",
    requiredPermissions: [PermissionsEnum.ViewProviders],
  },
  {
    path: "/admin/permissions",
    icon: Shield,
    label: "Quyền hạn",
    showOnlyInDev: true,
    requiredPermissions: [PermissionsEnum.ViewPermissions],
  },
  {
    path: "/admin/roles",
    icon: UserCog,
    label: "Vai trò",
    requiredPermissions: [PermissionsEnum.ViewRoles],
  },
  {
    path: "/admin/products",
    icon: Pizza,
    label: "Sản phẩm",
    requiredPermissions: [PermissionsEnum.ViewProducts],
  },
  {
    path: "/admin/categories",
    icon: ListOrdered,
    label: "Danh mục",
  },
  {
    path: "/admin/borders",
    icon: Box,
    label: "Viền bánh",
    requiredPermissions: [PermissionsEnum.ViewBorders],
  },
  {
    path: "/admin/materials",
    icon: Package,
    label: "Nguyên liệu",
  },
  {
    path: "/admin/sizes",
    icon: Ruler,
    label: "Kích thước",
    requiredPermissions: [PermissionsEnum.ViewSizes],
  },
  {
    path: "/admin/toppings",
    icon: Cherry,
    label: "Topping",
  },
  {
    path: "/admin/coupons",
    icon: Ticket,
    label: "Mã giảm giá",
    requiredPermissions: [PermissionsEnum.ViewCoupons],
  },
  {
    path: "/admin/imports",
    icon: PackageSearch,
    label: "Nhập hàng",
    requiredPermissions: [PermissionsEnum.ViewImports],
  },
  {
    path: "/admin/inventory",
    icon: Boxes,
    label: "Kho hàng",
    requiredPermissions: [PermissionsEnum.ViewInventory],
  },
  {
    path: "/admin/orders",
    icon: ClipboardList,
    label: "Đơn hàng",
  },
  {
    path: "/admin/ship/orders",
    icon: Package,
    label: "Đơn hàng cần giao",
    requiredPermissions: [
      PermissionsEnum.ViewOrders,
      PermissionsEnum.ViewDeliveries,
    ],
  },
  {
    path: "/admin/ship/delivery",
    icon: TruckIcon,
    label: "Chuyến giao hàng",
    requiredPermissions: [
      PermissionsEnum.ViewOrders,
      PermissionsEnum.ViewDeliveries,
    ],
  },
];

export default function Sidebar() {
  const staff = useStaff();
  const { roles } = useStaffRoles();
  const permissions = useStaffPermissions();
  const location = useLocation();
  return (
    <div className="bg-gray-100 h-full w-[250px] flex flex-col justify-between overflow-hidden">
      <nav className="max-h-full pb-[120px] overflow-y-auto pt-4">
        <ul className="space-y-1">
          {adminRoutes.map((route) => {
            // Check if the route requires permissions and if the user has the required roles
            const hasPermission = route.requiredPermissions
              ? route.requiredPermissions.every((perm) =>
                  permissions?.some((permission) => permission.name === perm),
                )
              : true;

            // Render the route only if it has permission or if it's a development-only route
            if (
              hasPermission &&
              (route.showOnlyInDev
                ? process.env.NODE_ENV === "development"
                : true)
            ) {
              return (
                <li key={route.path}>
                  <NavLink
                    to={route.path}
                    end={route.path === "/admin"}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2 px-4 py-2 transition-colors",
                        isActive
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-200",
                      )
                    }
                  >
                    {<route.icon className="w-4 h-4 flex-shrink-0" />}
                    <span>{route.label}</span>
                  </NavLink>
                </li>
              );
            }
            return null; // Skip rendering if no permission
          })}
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
