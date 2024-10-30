import { useState } from "react";
import { MediaButton } from "../shared/media-button";
import { Button } from "../ui/button";
import { X, FileText } from "lucide-react";

interface FileSelectorProps {
  initialFile?: string;
  mediaType: string;
  onFileSelected: (fileUrl: string | undefined) => void;
  placeholderText: string;
}

export const FileSelector: React.FC<FileSelectorProps> = ({
  initialFile,
  mediaType,
  onFileSelected,
  placeholderText,
}) => {
  const [file, setFile] = useState<string | undefined>(initialFile);

  const handleReset = () => {
    setFile(undefined);
    onFileSelected(undefined);
  };

  return (
    <div className="relative">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[150px] bg-gray-50">
        {file ? (
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-500" />
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline break-all"
            >
              {file.split("/").pop()}
            </a>
          </div>
        ) : (
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">{placeholderText}</p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <MediaButton
            type="button"
            mediaType={mediaType}
            variant="outline"
            selectedMedia={file}
            onSelected={(media) => {
              setFile(media.url);
              onFileSelected(media.url);
            }}
          >
            {file ? "Thay đổi file" : "Chọn file"}
          </MediaButton>

          {file && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleReset}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
