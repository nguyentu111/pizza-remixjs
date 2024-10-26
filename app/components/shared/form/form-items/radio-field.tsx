import { InputHTMLAttributes } from "react";
import { useFormField } from "../form-field";
import { cn } from "~/lib/utils";

export const RadioField = ({
  radios,
}: {
  radios: (InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    value: string;
  })[];
}) => {
  const { name } = useFormField();
  return (
    <div className="flex flex-wrap gap-4">
      {radios.map((r, i) => (
        <label
          key={r.value as string}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <input
            name={name}
            type="radio"
            className={cn("block", r.className)}
            {...r}
          />
          <span className="block ">{r.label}</span>
        </label>
      ))}
    </div>
  );
};
