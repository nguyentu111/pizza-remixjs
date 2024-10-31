import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z, ZodSchema } from "zod";
import { ParsedActionResult } from "~/lib/type";
import { useToast } from "./use-toast";
import { flattenObject } from "~/lib/utils";

export function useForm<T extends ZodSchema, E extends any = any>(options?: {
  onSuccess?: (data: E) => void;
  onError?: (error: string) => void;
  defaultValues?: Partial<z.infer<T>>;
}) {
  const fetcher = useFetcher<ParsedActionResult<T> | undefined>();
  const actionData = fetcher.data as ParsedActionResult<T> | undefined;
  const { toast } = useToast();
  const fieldErrors = actionData?.fieldErrors;
  const isSubmitting = fetcher.state === "submitting";
  const formRef = useRef<HTMLFormElement | null>(null);
  const control = {
    fieldErrors,
    defaultValues: flattenObject(options?.defaultValues || {}, "", {}),
  };
  useEffect(() => {
    console.log(actionData);
    if (!isSubmitting && actionData?.success) {
      if (options?.onSuccess && typeof options.onSuccess === "function") {
        options.onSuccess(actionData as unknown as E);
      } else {
        toast({
          title: "Lưu thành công",
        });
      }
    }
    if (!isSubmitting && actionData?.error) {
      if (options?.onError && typeof options.onError === "function") {
        options.onError(actionData.error);
      } else
        toast({
          title: "Uh oh. Có lỗi xảy ra.",
          description: actionData.error,
          variant: "destructive",
        });
    }
  }, [isSubmitting, actionData?.success]);

  return {
    fetcher,
    isSubmitting,
    formRef,
    actionData,

    fieldErrors,
    control,
  };
}
export type FormControl<T extends ZodSchema = ZodSchema> = ReturnType<
  typeof useForm<T>
>["control"];
