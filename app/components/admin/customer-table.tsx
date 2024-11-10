import { Customer, Order } from "@prisma/client";
import { Link } from "@remix-run/react";
import { format } from "date-fns";
import { EditIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useForm } from "~/hooks/use-form";
import { Input } from "../ui/input";
import { Pagination } from "../shared/pagination";
import { useStaffPermissions } from "~/hooks/use-staff-permissions";
import { useStaffRoles } from "~/hooks/use-staff-roles";
import { PermissionsEnum } from "~/lib/type";

export function CustomerTable({
  customers,
}: {
  customers: (Customer & { Orders: Order[] })[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumbers.includes(searchTerm),
  );

  const totalItems = filteredCustomers.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const permissions = useStaffPermissions();
  const hasDeletePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.DeleteCustomers,
  );
  const hasUpdatePermission = permissions?.some(
    (p) => p.name === PermissionsEnum.UpdateCustomers,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          type="text"
          placeholder="Tìm khách hàng..."
          className="max-w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Số đơn hàng</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <img
                  src={customer.avatarUrl || "/default-avatar.png"}
                  alt={`${customer.fullname}'s avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </TableCell>
              <TableCell>{customer.fullname}</TableCell>
              <TableCell>{customer.phoneNumbers}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    customer.status === "banned"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {customer.status === "banned" ? "Đã khóa" : "Hoạt động"}
                </span>
              </TableCell>
              <TableCell>{customer.Orders?.length || 0}</TableCell>
              <TableCell>{format(customer.createdAt, "dd/MM/yyyy")}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {hasDeletePermission && (
                    <fetcherDelete.Form
                      action={`/admin/customers/${customer.id}`}
                      method="DELETE"
                    >
                      <Button variant={"ghost-destructive"}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </fetcherDelete.Form>
                  )}
                  {hasUpdatePermission && (
                    <Button asChild>
                      <Link to={`/admin/customers/${customer.id}`}>
                        <EditIcon className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
}
