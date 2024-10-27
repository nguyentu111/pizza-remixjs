import { Customer, Staff } from "@prisma/client";
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
} from "~/components/ui/table"; // Use Shadcn UI Table components
import { useForm } from "~/hooks/use-form";
import { Input } from "../ui/input";
import { useStaff } from "~/lib/utils";

export function StaffTable({ staffs }: { staffs: Staff[] }) {
  const currentStaff = useStaff();
  const [searchTerm, setSearchTerm] = useState("");
  const { fetcher: fetcherDelete } = useForm({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const filteredStaffs = staffs.filter((staff) =>
    staff.fullname.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);
  const paginatedStaffs = filteredStaffs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  return (
    <div>
      <div className="flex items-center mb-6 justify-between">
        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`p-2 !min-w-[40px] ${currentPage === index + 1 ? "bg-blue-500 text-white rounded" : ""}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="flex">
          <Button asChild>
            <Link to="/admin/staffs/add" className="mr-4">
              Thêm tài khoản nhân viên
            </Link>
          </Button>
          <Input
            type="text"
            placeholder="Tìm tài khoản..."
            className="max-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Fullname</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>PhoneNumbers</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedStaffs.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell>
                <img
                  src={staff.image as string}
                  alt={`${staff.fullname}'s avatar`}
                  className="w-20 h-20 rounded-full"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {staff.fullname}{" "}
                  {currentStaff.id === staff.id && (
                    <div className="text-green-700 border-2 border-green-700 rounded-xl w-fit px-1 py-0.5 text-xs">
                      You
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{staff.username}</TableCell>
              <TableCell>{staff.phoneNumbers}</TableCell>
              <TableCell>{staff.status}</TableCell>
              <TableCell>{format(staff.createdAt, "dd/MM/yyyy")}</TableCell>
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
