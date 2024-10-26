import { useFormField } from "./form-field";

export const ErrorMessage = () => {
  const { error } = useFormField();
  return (
    <div>
      {error?.map((e) => (
        <p key={e} className="text-xs text-rose-500">
          {e}
        </p>
      ))}
    </div>
  );
};
