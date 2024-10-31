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

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Get active coupons (not expired)
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
  const { toast } = useToast();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Khuyến Mãi Đang Diễn Ra</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </div>
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
    <Card className="overflow-hidden">
      {coupon.bannerImage && (
        <img
          src={coupon.bannerImage}
          alt={coupon.name}
          className="w-full h-48 object-cover"
        />
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{coupon.name}</span>
          <Badge variant="secondary">
            Giảm {Number(coupon.discount).toFixed(0)}%
          </Badge>
        </CardTitle>
        <CardDescription>{coupon.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
          <code className="flex-1 font-mono text-lg">{coupon.code}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        <p>Hết hạn: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}</p>
      </CardFooter>
    </Card>
  );
}
