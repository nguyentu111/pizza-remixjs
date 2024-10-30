import { useFormField } from "./form-field";

export const ErrorMessage = () => {
  const { error } = useFormField();
  return (
    <div>
      {error && <p className="text-xs text-rose-500">{error.message}</p>}
    </div>
  );
};
