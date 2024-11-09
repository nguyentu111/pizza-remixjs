import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useFetcher } from "@remix-run/react";

export function RatingForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [description, setDescription] = useState("");
  const fetcher = useFetcher();

  const handleSubmit = () => {
    fetcher.submit(
      {
        orderId,
        stars: rating.toString(),
        description,
      },
      {
        method: "POST",
        action: "/api/rating",
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-lg shadow-md space-y-4"
    >
      <h3 className="font-semibold">Đánh giá đơn hàng</h3>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
          >
            <StarIcon
              className={`w-8 h-8 ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </motion.button>
        ))}
      </div>

      <Textarea
        placeholder="Nhập đánh giá của bạn..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full"
      />

      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || fetcher.state === "submitting"}
        className="w-full"
      >
        {fetcher.state === "submitting" ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </motion.div>
  );
}
