import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Table,
  TableCell,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleByName,
} from "~/models/role.server";
import { json } from "@remix-run/node";
import { ca, safeAction } from "~/lib/utils";
import { z } from "zod";
import { useForm } from "~/hooks/use-form";
import { getAllPermissions } from "~/models/permission.server";
import { Input } from "~/components/ui/input";
import { EditIcon, Trash, TrashIcon } from "lucide-react";
import { prisma } from "~/lib/db.server";

export const loader = async () => {
  const roles = await getAllRoles();
  const permissions = await getAllPermissions(prisma);
  return json({ roles, permissions });
};

export default function RoleManagement() {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lí quyền</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Quản lí quyền
          </nav>
        </div>
      </div>
      <RoleTable />
    </>
  );
}

function RoleTable() {
  const { roles } = useLoaderData<typeof loader>();
  const { fetcher: fetcherDelete } = useForm();

  // New state for search term and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page

  // Filter roles based on search term
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div>
      <div className="flex items-center mb-6 justify-between">
        <div className="flex justify-between mt-4">
          <div>
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
        </div>
        <div className="flex">
          <Button asChild>
            <Link to="/admin/roles/add" className="mr-4">
              Thêm quyền
            </Link>
          </Button>

          <Input
            type="text"
            placeholder="Search roles..."
            className="max-w-[200px] mr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRoles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell className="flex gap-4">
                <fetcherDelete.Form
                  action={`/admin/roles/${role.id}`}
                  method="DELETE"
                >
                  <Button variant={"ghost-destructive"}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </fetcherDelete.Form>
                <Button asChild>
                  <Link to={`/admin/roles/${role.id}`}>
                    <EditIcon className="w-4 h-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
