import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { UploadMediaActionResponse } from "~/routes/api.media.upload";
import { useState } from "react";

export const UploadFile = ({
  onUploaded,
}: {
  onUploaded?: (result: UploadMediaActionResponse) => void;
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<UploadMediaActionResponse | null>();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  };
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file); // Append each file to the FormData object
    });
    fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data: UploadMediaActionResponse) => {
        setData(data);
        onUploaded && onUploaded(data);
      })

      .finally(() => setIsSubmitting(false));
  };
  return (
    <form className="space-y-2 flex flex-col" onSubmit={handleSubmit}>
      <label className="h-[200px] border-dashed p-4 rounded border-2 border-black">
        <p className="block text-center">
          Upload files {selectedFiles.length > 1 && `(${selectedFiles.length})`}
        </p>
        {selectedFiles.slice(0, 5).map((f) => (
          <p className="block text-center" key={f.name}>
            {f.name}
          </p>
        ))}
        {selectedFiles.length >= 6 && (
          <p className="block text-center">
            + {selectedFiles.length - 5} other(s)
          </p>
        )}
        <Input
          type="file"
          name="file"
          multiple
          className="h-[300px] hidden"
          onChange={handleFileChange}
        />
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Uploading..." : "Upload File"}
      </Button>
      {data && (data.success ? "Uploaded" : "Failed")}
    </form>
  );
};
