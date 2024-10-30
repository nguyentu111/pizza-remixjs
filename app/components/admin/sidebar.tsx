import { Form, NavLink } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { useStaff } from "~/hooks/use-staff";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useStaffRoles } from "~/hooks/use-staff-roles";

export default function Sidebar() {
  const staff = useStaff();
  const roles = useStaffRoles();
  return (
    <div className="bg-gray-100 h-full min-w-[200px] flex flex-col justify-between py-4">
      <nav>
        <ul>
          <li>
            <NavLink
              to="/admin/staffs"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Staffs
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/providers"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Providers
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/permissions"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Permissions
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/roles"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Roles
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Categories
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/borders"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Borders
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/materials"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Materials
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/sizes"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Sizes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/toppings"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Toppings
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/coupons"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Coupons
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/imports"
              className={({ isActive }) =>
                cn(isActive ? "rounded bg-blue-500" : "", "px-4 py-2 block ")
              }
            >
              Imports
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img className="rounded-full w-10 h-10" src={staff.image ?? ""} />
          <div className="flex flex-col">
            <div className="font-bold capitalize">{staff.fullname}</div>
            <div className="text-sm text-gray-500">
              Vai trò: {roles?.[0]?.name}
            </div>
          </div>
        </div>
        <Form action="/logout" method="post">
          <Button
            variant={"ghost"}
            type="submit"
            className="rounded px-4 py-2 "
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </Form>
      </div>
    </div>
  );
}
