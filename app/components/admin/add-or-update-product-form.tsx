import { zodResolver } from "@hookform/resolvers/zod";
import { Border, Category, Material, Size, Topping } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertProductSchema } from "~/lib/schema";
import { ParsedActionResult, ProductWithRelations } from "~/lib/type";
import { Button } from "../ui/button";
import { InputField } from "../shared/form/hook-form-fields/input-field";
import { TextareaField } from "../shared/form/hook-form-fields/textarea-field";
import { SelectField } from "../shared/form/hook-form-fields/select-field";
import { MultiSelectField } from "../shared/form/hook-form-fields/multi-select-field";
import { ImageSelector } from "./image-selector";
import { Card, CardContent } from "../ui/card";
import { DynamicSizeForm } from "./dynamic-size-form";
import { DynamicRecipeForm } from "./dynamic-recipe-form";
import { useFetcher } from "@remix-run/react";
import { useToast } from "~/hooks/use-toast";
import { useEffect } from "react";
import { Form } from "../ui/form";

interface AddOrUpdateProductFormProps {
  product?: ProductWithRelations;
  categories: Category[];
  borders: Border[];
  toppings: Topping[];
  sizes: Size[];
  materials: Material[];
}

export const AddOrUpdateProductForm = ({
  product,
  categories,
  borders,
  toppings,
  sizes,
  materials,
}: AddOrUpdateProductFormProps) => {
  console.log({ borders, categories, toppings, sizes, materials });
  const navigate = useNavigate();
  const fetcher = useFetcher<ParsedActionResult<typeof insertProductSchema>>();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          shortDescription: product.shortDescription,
          detailDescription: product.detailDescription || "",
          slug: product.slug,
          categoryId: product.categoryId,
          image: product.image || undefined,
          image_mobile: product.image_mobile || undefined,
          borderIds: product.Borders.map((b) => b.borderId),
          toppingIds: product.Toppings.map((t) => t.toppingId),
          sizes: product.Sizes.map((s) => ({
            sizeId: s.sizeId,
            price: String(s.price),
          })),
          recipes: product.Recipes.map((r) => ({
            materialId: r.materialId,
            quantity: String(r.quantity),
          })),
        }
      : {
          name: "",
          shortDescription: "",
          detailDescription: "",
          slug: "",
          categoryId: "",
          sizes: [],
          recipes: [],
        },
  });

  const onSubmit = async (values: z.infer<typeof insertProductSchema>) => {
    fetcher.submit(values, {
      method: product ? "PUT" : "POST",
      action: product ? `/admin/products/${product.id}` : "/admin/products/add",
      encType: "application/json",
    });
  };
  useEffect(() => {
    if (fetcher.data?.success) {
      toast({
        title: product ? "Cập nhật thành công" : "Thêm mới thành công",
      });
      navigate("/admin/products");
    }
  }, [fetcher.data]);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <InputField
                  control={form.control}
                  name="name"
                  label="Tên sản phẩm"
                  placeholder="Nhập tên sản phẩm"
                />

                <TextareaField
                  control={form.control}
                  name="shortDescription"
                  label="Mô tả ngắn"
                  placeholder="Nhập mô tả ngắn"
                />

                <TextareaField
                  control={form.control}
                  name="detailDescription"
                  label="Mô tả chi tiết"
                  placeholder="Nhập mô tả chi tiết"
                />

                <InputField
                  control={form.control}
                  name="slug"
                  label="Slug"
                  placeholder="Nhập slug"
                />

                <SelectField
                  control={form.control}
                  name="categoryId"
                  label="Danh mục"
                  placeholder="Chọn danh mục"
                  options={categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                />

                <MultiSelectField
                  control={form.control}
                  name="borderIds"
                  label="Viền bánh"
                  placeholder="Chọn viền bánh"
                  options={borders.map((border) => ({
                    label: border.name,
                    value: border.id,
                  }))}
                />

                <MultiSelectField
                  control={form.control}
                  name="toppingIds"
                  label="Topping"
                  placeholder="Chọn topping"
                  options={toppings.map((topping) => ({
                    label: topping.name,
                    value: topping.id,
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-medium mb-2">Ảnh sản phẩm</h3>
                <ImageSelector
                  initialImage={product?.image || undefined}
                  mediaType="product"
                  onImageSelected={(url) => form.setValue("image", url)}
                  placeholderText="Chọn ảnh sản phẩm"
                />
              </div>

              <div>
                <h3 className="font-medium mb-2">Ảnh sản phẩm (mobile)</h3>
                <ImageSelector
                  initialImage={product?.image_mobile || undefined}
                  mediaType="product"
                  onImageSelected={(url) => form.setValue("image_mobile", url)}
                  placeholderText="Chọn ảnh sản phẩm (mobile)"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <DynamicSizeForm
              control={form.control}
              sizes={sizes}
              defaultValues={product?.Sizes}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <DynamicRecipeForm
              control={form.control}
              materials={materials}
              defaultValues={product?.Recipes}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/products")}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={fetcher.state !== "idle"}>
            {product ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
