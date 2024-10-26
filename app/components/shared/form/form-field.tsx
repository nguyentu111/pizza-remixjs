import React from "react";
interface Props<
  E extends Record<string, string[] | undefined>,
  T extends {
    fieldErrors?: E;
    defaultValues?: Partial<Record<keyof E, any>>;
  },
> {
  control: T;
  name?: keyof NonNullable<T["fieldErrors"]>;
  children: React.ReactNode;
}
// type FormFieldContextValue<
//   E = Record<string, string[] | undefined>,
//   T extends {
//     fieldErrors?: E;
//     defaultValues?: Partial<Record<keyof E, any>>;
//   },
// > = Omit<Props<E, T>,''>;
const FormFieldContext = React.createContext({
  name: "",
} as {
  name?: string;
  defaultValue: any;
  error?: string[];
});
export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { name } = fieldContext;

  return {
    ...fieldContext,
    formMessageId: `${name}-form-item-message`,
  };
};
export const FormField = <
  E extends Record<string, string[] | undefined>,
  T extends {
    fieldErrors?: E;
    defaultValues?: Partial<Record<keyof E, any>>;
  },
>({
  children,
  control,
  name,
}: Props<E, T>) => {
  const defaultValue =
    name && control?.defaultValues ? control?.defaultValues[name] : undefined;
  const error =
    name && control?.fieldErrors ? control?.fieldErrors[name] : undefined;
  return (
    <FormFieldContext.Provider
      value={{
        name: name as string,
        defaultValue,
        error,
      }}
    >
      <div className="flex flex-col gap-2 mb-2">{children}</div>
    </FormFieldContext.Provider>
  );
};
