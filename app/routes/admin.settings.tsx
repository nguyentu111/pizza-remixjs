import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { ErrorMessage } from "~/components/shared/form/error-message";
import { FormField } from "~/components/shared/form/form-field";
import { InputField } from "~/components/shared/form/form-fields/input-field";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { useForm } from "~/hooks/use-form";
import { prisma } from "~/lib/db.server";
import { settingsSchema } from "~/lib/schema";
import { PermissionsEnum } from "~/lib/type";
import { safeAction } from "~/lib/utils";
import { requireStaffId } from "~/session.server";
import { requirePermissions } from "~/use-cases/permission.server";

const DEFAULT_SETTINGS = {
  orderStartTime: "08:00",
  orderEndTime: "21:00",
  autoCancelOrderAfter: "30",
  maxDeliveryRadius: "10",
  storeLat: "10.762622",
  storeLng: "106.660172",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const staffId = await requireStaffId(request);
  await requirePermissions(prisma, staffId, [PermissionsEnum.ManageSettings]);

  const settings = await prisma.settings.findMany();
  const formattedSettings = Object.keys(DEFAULT_SETTINGS).reduce(
    (acc, key) => {
      const setting = settings.find((s) => s.name === key);
      acc[key] =
        setting?.value ||
        DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS];
      return acc;
    },
    {} as Record<string, string>,
  );

  return json({ settings: formattedSettings });
};

export const action = safeAction([
  {
    method: "PUT",
    schema: settingsSchema,
    action: async ({ request }, data) => {
      const staffId = await requireStaffId(request);
      await requirePermissions(prisma, staffId, [
        PermissionsEnum.ManageSettings,
      ]);

      const validatedData = data as z.infer<typeof settingsSchema>;
      // Update settings in transaction
      await prisma.$transaction(
        Object.entries(validatedData).map((setting) =>
          prisma.settings.upsert({
            where: { name: setting[0] },
            create: { value: setting[1], name: setting[0] },
            update: { value: setting[1] },
          }),
        ),
      );

      return json({ success: true });
    },
  },
]);

export default function SettingsPage() {
  const { settings } = useLoaderData<typeof loader>();

  const form = useForm({
    defaultValues: {
      orderStartTime: settings.orderStartTime,
      orderEndTime: settings.orderEndTime,
      autoCancelOrderAfter: settings.autoCancelOrderAfter,
      maxDeliveryRadius: settings.maxDeliveryRadius,
      storeLat: settings.storeLat,
      storeLng: settings.storeLng,
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Cài đặt hệ thống</h1>
          <nav className="text-sm text-gray-600">
            <a href="/admin" className="hover:underline">
              Trang chủ
            </a>{" "}
            &gt; Cài đặt hệ thống
          </nav>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto p-6">
        <form.fetcher.Form method="PUT" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="orderStartTime">
              <Label>Thời gian bắt đầu nhận đơn</Label>
              <InputField type="time" required />
              <ErrorMessage />
            </FormField>

            <FormField control={form.control} name="orderEndTime">
              <Label>Thời gian kết thúc nhận đơn</Label>
              <InputField type="time" required />
              <ErrorMessage />
            </FormField>
          </div>

          <FormField control={form.control} name="autoCancelOrderAfter">
            <Label>
              Tự động hủy đơn hàng sau (phút)
              <span className="text-sm text-gray-500 ml-2">
                (nếu không có đầu bếp/shipper nhận đơn)
              </span>
            </Label>
            <InputField type="number" min={1} required />
            <ErrorMessage />
          </FormField>

          <FormField control={form.control} name="maxDeliveryRadius">
            <Label>
              Phạm vi giao hàng tối đa (km)
              <span className="text-sm text-gray-500 ml-2">
                (khoảng cách tính từ cửa hàng)
              </span>
            </Label>
            <InputField type="number" min={1} step="0.1" required />
            <ErrorMessage />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="storeLat">
              <Label>Vĩ độ cửa hàng</Label>
              <InputField type="text" required placeholder="Ví dụ: 10.762622" />
              <ErrorMessage />
            </FormField>

            <FormField control={form.control} name="storeLng">
              <Label>Kinh độ cửa hàng</Label>
              <InputField
                type="text"
                required
                placeholder="Ví dụ: 106.660172"
              />
              <ErrorMessage />
            </FormField>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={form.isSubmitting}
              className="min-w-[150px]"
            >
              {form.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form.fetcher.Form>
      </Card>
    </div>
  );
}
