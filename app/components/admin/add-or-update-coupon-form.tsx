import { Coupon } from "@prisma/client";
import { useForm } from "~/hooks/use-form";
import { useToast } from "~/hooks/use-toast";
import { insertCouponSchema } from "~/lib/schema";
import { useModal } from "../providers/modal-provider";
import { Button } from "../ui/button";
import { FormField } from "../shared/form/form-field";
import { Label } from "../ui/label";
import { InputField } from "../shared/form/form-fields/input-field";
import { ErrorMessage } from "../shared/form/error-message";
import { useState } from "react";
import { ImageSelector } from "./image-selector";
import { TextareaField } from "../shared/form/form-fields/text-area-field";

export const AddOrUpdateCouponForm = ({ coupon }: { coupon?: Coupon }) => {
  const { toast } = useToast();
  const { setClose } = useModal();
  const [image, setImage] = useState<string | undefined>(
    coupon?.image ?? undefined,
  );
  const [bannerImage, setBannerImage] = useState<string | undefined>(
    coupon?.bannerImage ?? undefined,
  );
  const { fetcher, formRef, control } = useForm<typeof insertCouponSchema>({
    onError: (error) => {
      toast({
        title: "Uh oh. Có lỗi xảy ra!",
        description: error,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: coupon?.id ? "Sửa thành công." : "Thêm thành công.",
      });
      setClose();
    },
    defaultValues: {
      ...coupon,
      name: coupon?.name ?? undefined,
      description: coupon?.description ?? undefined,
      discount: coupon?.discount?.toString(),
      quantity: coupon?.quantity,
      startDate: coupon?.startDate
        ? new Date(coupon.startDate).toISOString().split("T")[0]
        : undefined,
      endDate: coupon?.endDate
        ? new Date(coupon.endDate).toISOString().split("T")[0]
        : undefined,
      image: coupon?.image ?? undefined,
      bannerImage: coupon?.bannerImage ?? undefined,
    },
  });

  return (
    <fetcher.Form
      action={coupon?.id ? `/admin/coupons/${coupon.id}` : "/admin/coupons/add"}
      method={coupon?.id ? "PUT" : "POST"}
      ref={formRef}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <ImageSelector
            initialImage={coupon?.image ?? undefined}
            mediaType="coupon"
            onImageSelected={setImage}
            placeholderText="Chọn ảnh mã giảm giá"
          />

          <ImageSelector
            initialImage={coupon?.bannerImage ?? undefined}
            mediaType="coupon"
            onImageSelected={setBannerImage}
            placeholderText="Chọn ảnh banner"
          />
        </div>

        <FormField control={control} name="code">
          <Label>Mã giảm giá</Label>
          <InputField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="name">
          <Label>Tên mã giảm giá</Label>
          <InputField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="description">
          <Label>Mô tả</Label>
          <TextareaField />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="discount">
          <Label>Giảm giá (%)</Label>
          <InputField type="number" step="0.01" />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="quantity">
          <Label>Số lượng</Label>
          <InputField type="number" />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="startDate">
          <Label>Ngày bắt đầu</Label>
          <InputField type="date" />
          <ErrorMessage />
        </FormField>

        <FormField control={control} name="endDate">
          <Label>Ngày kết thúc</Label>
          <InputField type="date" />
          <ErrorMessage />
        </FormField>
      </div>

      <input
        value={image ?? ""}
        name="image"
        className="hidden"
        onChange={() => {}}
      />

      <input
        value={bannerImage ?? ""}
        name="bannerImage"
        className="hidden"
        onChange={() => {}}
      />

      <Button type="submit" className="mt-4">
        {coupon?.id ? "Cập nhật mã giảm giá" : "Tạo mã giảm giá"}
      </Button>
    </fetcher.Form>
  );
};
