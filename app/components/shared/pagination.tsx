import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
}

const pageSizeOptions = [5, 10, 20, 50, 100];

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: PaginationProps) {
  const [inputPage, setInputPage] = useState("");

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const pageNumber = parseInt(inputPage);
      if (!isNaN(pageNumber)) {
        if (pageNumber < 1) {
          onPageChange(1);
        } else if (pageNumber > totalPages) {
          onPageChange(totalPages);
        } else {
          onPageChange(pageNumber);
        }
        setInputPage("");
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="Trang đầu"
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm">
          Trang {currentPage}/{totalPages}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Trang cuối"
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Đi tới trang..."
          className="w-28"
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onKeyDown={handlePageInput}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm whitespace-nowrap">Hiển thị</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm whitespace-nowrap">
          / {totalItems} bản ghi
        </span>
      </div>
    </div>
  );
}
