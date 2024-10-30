import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";

export function AddressSearch() {
  return (
    <div className="bg-blue-900 text-white p-6 py-12 rounded-lg mb-8 ">
      <div className="flex flex-col items-center max-w-4xl w-[95vw] mx-auto">
        <div className="flex items-center space-x-4 w-full">
          <Input
            type="text"
            placeholder="Nhà Thờ Đức Mẹ Nữ Vương Hòa Bình,Đường Lê Đức Thọ,Phường 13,Gò Vấp"
            className="flex-grow bg-white text-black"
          />
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Search className="mr-2" />
            Tìm kiếm
          </Button>
        </div>
        <p className="mt-2 text-center text-sm">
          Hoặc Chọn Địa Chỉ Giao Hàng Có Sẵn Từ Số Địa Chỉ
        </p>
      </div>
    </div>
  );
}
