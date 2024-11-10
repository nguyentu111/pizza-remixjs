import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { Badge } from "~/components/ui/badge";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "usehooks-ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const coupons = await prisma.coupon.findMany({
    where: {
      endDate: {
        gte: new Date(),
      },
      startDate: {
        lte: new Date(),
      },
      quantity: {
        gt: 0,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ coupons });
};

export default function PromotionsPage() {
  const { coupons } = useLoaderData<typeof loader>();
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto pb-8 pt-16"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold mb-6"
      >
        Khuyến Mãi Đang Diễn Ra
      </motion.h1>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        ref={ref}
      >
        {coupons.map((coupon, index) => (
          <motion.div
            key={coupon.id}
            initial={{ y: 50, opacity: 0 }}
            animate={isIntersecting ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <CouponCard coupon={coupon} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function CouponCard({ coupon }: { coupon: any }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast({
      title: "Đã sao chép",
      description: "Mã giảm giá đã được sao chép vào clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden h-full">
      {coupon.bannerImage && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <img
            src={coupon.bannerImage}
            alt={coupon.name}
            className="w-full h-48 object-cover"
          />
        </motion.div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{coupon.name}</span>
          <Badge variant="secondary" className="animate-pulse">
            Giảm {Number(coupon.discount).toFixed(0)}%
          </Badge>
        </CardTitle>
        <CardDescription>{coupon.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 bg-muted p-2 rounded-lg"
        >
          <code className="flex-1 font-mono text-lg">{coupon.code}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            <motion.div
              animate={copied ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        <p>Hết hạn: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}</p>
      </CardFooter>
    </Card>
  );
}
