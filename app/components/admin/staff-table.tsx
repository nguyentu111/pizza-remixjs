import { Staff, StaffRole } from "@prisma/client";
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
import { getSmallImageUrl } from "~/lib/utils";
import { Pagination } from "../shared/pagination";

export function StaffTable({
  staffs,
}: {
  staffs: (Staff & { Roles: StaffRole[] })[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredStaffs = staffs.filter(
    (staff) =>
      staff.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phoneNumbers.includes(searchTerm),
  );

  const totalItems = filteredStaffs.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedStaffs = filteredStaffs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild>
          <Link to="/admin/staffs/add">Thêm nhân viên</Link>
        </Button>
        <Input
          type="text"
          placeholder="Tìm nhân viên..."
          className="max-w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ảnh</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Tài khoản</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedStaffs.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell>
                {staff.image && (
                  <img
                    src={getSmallImageUrl(staff.image)}
                    alt={staff.fullname}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
              </TableCell>
              <TableCell>{staff.fullname}</TableCell>
              <TableCell>{staff.username}</TableCell>
              <TableCell>{staff.phoneNumbers}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    staff.status === "banned"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {staff.status === "banned" ? "Đã khóa" : "Hoạt động"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <fetcherDelete.Form
                    action={`/admin/staffs/${staff.id}`}
                    method="DELETE"
                  >
                    <Button variant={"ghost-destructive"}>
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </fetcherDelete.Form>
                  <Button asChild>
                    <Link to={`/admin/staffs/${staff.id}`}>
                      <EditIcon className="w-4 h-4" />
                    </Link>
                  </Button>
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
