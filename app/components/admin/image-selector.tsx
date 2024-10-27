import { useState } from "react";
import { MediaButton } from "../shared/media-button";
import { getSmallImageUrl } from "~/lib/utils";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface ImageSelectorProps {
  initialImage?: string;
  mediaType: string;
  onImageSelected: (imageUrl: string | undefined) => void;
  placeholderText: string;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  initialImage,
  mediaType,
  onImageSelected,
  placeholderText,
}) => {
  const [image, setImage] = useState<string | undefined>(initialImage);

  const handleReset = () => {
    setImage(undefined);
    onImageSelected(undefined);
  };

  return (
    <div className="">
      <div
        className="object-cover relative aspect-square h-[200px] mb-4 flex items-center justify-center border-2 border-black"
        style={{
          backgroundImage: image
            ? `url(${getSmallImageUrl(image)})`
            : undefined,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <MediaButton
          type="button"
          mediaType={mediaType}
          className="!px-0 w-full h-full"
          variant={"link"}
          selectedMedia={image}
          onSelected={(media) => {
            setImage(media.url);
            onImageSelected(media.url);
          }}
        >
          {image ? "" : placeholderText}
        </MediaButton>
        {image && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute bottom-6 right-2"
            onClick={handleReset}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
