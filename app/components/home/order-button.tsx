import { Button } from "~/components/ui/button";

export function OrderButtons() {
  return (
    <div className="flex justify-center space-x-4 mb-8">
      <Button className="bg-red-500 text-white px-6 py-3 rounded-full">
        Giao Hàng Tận Nơi
      </Button>
      <Button className="bg-blue-500 text-white px-6 py-3 rounded-full">
        Đặt Đến Lấy
      </Button>
    </div>
  );
}
