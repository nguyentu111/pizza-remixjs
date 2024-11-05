import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import type { Delivery, DeliveryStatus } from "@prisma/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  delivery: {
    id: string;
    status: DeliveryStatus;
    staffId: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    DeliveryOrder: Array<{
      orderId: string;
      order: {
        address: string;
      };
    }>;
  };
  currentOrderIndex: number;
  onOrderSelect: (index: number) => void;
  buttonPosition: { x: number; y: number } | null;
}

export function OrdersList({
  isOpen,
  onClose,
  delivery,
  currentOrderIndex,
  onOrderSelect,
  buttonPosition,
}: Props) {
  if (!buttonPosition) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1999] bg-black/20"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            style={{
              position: "fixed",
              top: buttonPosition.y - 320, // Adjust this value to position the popup
              right: 20,
              zIndex: 2000,
              width: "300px",
              maxHeight: "300px",
            }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-3 border-b flex justify-between items-center">
              <h2 className="text-sm font-semibold">Danh sách đơn hàng</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-auto max-h-[250px] p-2 space-y-2">
              {delivery.DeliveryOrder.map((deliveryOrder, index) => (
                <Card
                  key={deliveryOrder.orderId}
                  className={`p-2 cursor-pointer transition-all hover:bg-gray-50 ${
                    currentOrderIndex === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    onOrderSelect(index);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm 
                        ${
                          currentOrderIndex === index
                            ? "bg-primary text-white"
                            : "bg-gray-200"
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        #{deliveryOrder.orderId.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {deliveryOrder.order.address}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
