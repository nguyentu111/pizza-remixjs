import { useFetcher } from "@remix-run/react";
import { InputHTMLAttributes, useEffect, useRef } from "react";
import { TypeOf, z, ZodSchema } from "zod";
import { ParsedActionResult, RawActionResult } from "~/lib/type";
import { Input, InputProps } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { Switch } from "~/components/ui/switch";
import { R } from "vitest/dist/reporters-yx5ZTtEV";
import { useToast } from "./use-toast";
import { Checkbox } from "components/ui/checkbox";

export function useForm<T extends ZodSchema>(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
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
  useEffect(() => {
    console.log("FETCHER ACTION DATA : ", fetcher.data);
    if (!isSubmitting && actionData?.success) {
      options?.onSuccess && options.onSuccess();
    }
    if (!isSubmitting && actionData?.error) {
      toast({
        title: "Uh oh. Có lỗi xảy ra.",
        description: actionData.error,
        variant: "destructive",
      });
      options?.onError && options.onError(actionData.error);
    }
  }, [isSubmitting, actionData?.success]);
  function createInput(
    {
      className,
      name,
      type,
      ...props
    }: InputProps & {
      name: keyof z.infer<T>;
    },
    options?: { label?: string },
  ) {
    return (
      <div className="flex gap-2 flex-col mb-4">
        {options?.label && <Label htmlFor={name}>{options.label}</Label>}
        <Input
          id={name}
          className={cn(className)}
          name={name}
          type={type}
          {...props}
        />
        {fieldErrors?.[name] &&
          fieldErrors?.[name].map((error) => (
            <p key={error} className="text-destructive text-sm">
              {error}
            </p>
          ))}
      </div>
    );
  }
  function createRadios(
    radios: (InputHTMLAttributes<HTMLInputElement> & {
      name: keyof z.infer<T>;
      label: string;
      value: string;
    })[],
    options?: { topLabel?: string },
  ) {
    return (
      <div className="flex gap-2 flex-col mb-4">
        {options?.topLabel && <Label>{options.topLabel}</Label>}
        <div className="flex flex-wrap gap-4">
          {radios.map((r, i) => (
            <label
              key={r.value as string}
              className="flex items-center justify-center gap-2 mb-2"
            >
              <input {...r} type="radio" className={cn("block", r.className)} />
              <span className="block ">{r.label}</span>
            </label>
          ))}
        </div>
        {fieldErrors?.[radios[0]?.name as string] &&
          fieldErrors?.[radios[0].name as string]?.map((error) => (
            <p key={error} className="text-destructive text-sm">
              {error}
            </p>
          ))}
      </div>
    );
  }
  function createSwitch(
    { name, defaultChecked }: InputProps & { name: keyof z.infer<T> },
    options?: { label?: string },
  ) {
    return (
      <div className="flex gap-2 flex-col mb-4">
        {options?.label && <Label htmlFor={name}>{options.label}</Label>}
        <div className="h-9 flex items-center ">
          <Switch id={name} name={name} defaultChecked={defaultChecked} />
        </div>
        {fieldErrors?.[name] &&
          fieldErrors?.[name]?.map((error) => (
            <p key={error} className="text-destructive text-sm">
              {error}
            </p>
          ))}
      </div>
    );
  }
  function createCheckboxes(
    checkboxs: {
      name: keyof z.infer<T>;
      label: string;
      value: string;
      className?: string;
      defaultChecked?: boolean;
    }[],
    options?: { topLabel?: string },
  ) {
    return (
      <div className="flex gap-2 flex-col mb-4">
        {options?.topLabel && <Label>{options.topLabel}</Label>}
        <div className="flex flex-wrap gap-8">
          {checkboxs.map((r, i) => (
            <div key={r.value} className="flex items-center h-9">
              <Checkbox
                id={r.value}
                name={r.name as string}
                value={r.value}
                className={cn("block", r.className)}
                defaultChecked={r.defaultChecked}
              />
              <Label htmlFor={r.value} className="ml-2">
                {r.label}
              </Label>
            </div>
          ))}
        </div>
        {fieldErrors?.[checkboxs[0]?.name as string] &&
          fieldErrors?.[checkboxs[0].name as string]?.map((error) => (
            <p key={error} className="text-destructive text-sm">
              {error}
            </p>
          ))}
      </div>
    );
  }
  function ErrorMessage() {
    return (
      !isSubmitting &&
      actionData?.error && (
        <p className="text-destructive text-sm mb-4">{actionData?.error}</p>
      )
    );
  }
  function SuccessMessage({ message }: { message: string }) {
    return (
      !isSubmitting &&
      actionData?.success && (
        <p className="text-green-700 text-sm mb-4">{message}</p>
      )
    );
  }
  return {
    fetcher,
    createInput,
    createRadios,
    isSubmitting,
    formRef,
    actionData,
    ErrorMessage,
    SuccessMessage,
    createSwitch,
    createCheckboxes,
  };
}
