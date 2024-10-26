import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useRef } from "react";
import { MediaType } from "@prisma/client";
import { useForm } from "~/hooks/use-form";
export const UploadFile = ({ mediaType }: { mediaType: MediaType }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false); // State for drag status
  const { fetcher } = useForm();
  const inputRef = useRef<HTMLInputElement | null>(null); // Create a ref for the input

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  };

  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    setIsDragging(false); // Reset dragging state
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);

    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      inputRef.current.files = dataTransfer.files; // Set the files to the input using ref
    }
  };

  const handleDragOver: React.DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    setIsDragging(true); // Set dragging state
  };

  const handleDragLeave: React.DragEventHandler<HTMLLabelElement> = () => {
    setIsDragging(false); // Reset dragging state when leaving
  };

  return (
    <fetcher.Form
      encType="multipart/form-data"
      className="space-y-2 flex flex-col"
      action="/admin"
      method="post"
    >
      <input name="type" value={mediaType} hidden />
      <label
        className={`h-[200px] border-dashed p-4 rounded border-2 ${isDragging ? "border-blue-500" : "border-black"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver} // Handle drag over
        onDragLeave={handleDragLeave} // Handle drag leave
      >
        <p className="block text-center">
          {isDragging
            ? "Drop here"
            : `Upload files ${selectedFiles.length > 1 ? `(${selectedFiles.length})` : ""}`}
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
          name="files"
          multiple
          className="h-[300px] hidden"
          onChange={handleFileChange}
          ref={inputRef} // Attach the ref to the input
        />
      </label>
      <Button
        type="submit"
        disabled={fetcher.state === "submitting"}
        name="_action"
        value="upload-media"
      >
        {fetcher.state === "submitting" ? "Uploading..." : "Upload File"}
      </Button>
    </fetcher.Form>
  );
};
