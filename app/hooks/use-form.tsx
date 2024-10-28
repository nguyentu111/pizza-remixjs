import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z, ZodSchema } from "zod";
import { ParsedActionResult } from "~/lib/type";
import { useToast } from "./use-toast";

export function useForm<T extends ZodSchema>(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  defaultValues?: Partial<z.infer<T>>;
}) {
  const fetcher = useFetcher<ParsedActionResult<T> | undefined>();
  const actionData = fetcher.data as ParsedActionResult<T> | undefined;
  const { toast } = useToast();
  const fieldErrors = actionData?.fieldErrors as
    | {
        [K in keyof z.infer<T>]: string[] | undefined;
      }
    | undefined;
  const isSubmitting = fetcher.state === "submitting";
  const formRef = useRef<HTMLFormElement | null>(null);
  const control = {
    fieldErrors,
    defaultValues: options?.defaultValues,
  };
  useEffect(() => {
    console.log(actionData);
    if (!isSubmitting && actionData?.success) {
      if (options?.onSuccess && typeof options.onSuccess === "function") {
        options.onSuccess();
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
