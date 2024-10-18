import { Media } from "@prisma/client";
import { useModal } from "../providers/modal-provider";
import { Button, ButtonProps } from "../ui/button";
import CustomModal from "./custom-modal";
import { MediaBucket } from "./media-bucket";
interface Props extends ButtonProps {
  onSelected?: (media: Media) => void;
  selectedMedia?: Media;
}
export const MediaButton = ({
  onSelected,
  selectedMedia,
  children,
  ...rest
}: Props) => {
  const { setOpen, setClose } = useModal();

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Media bucket"
            subheading=""
            contentClass="w-[95vw] max-w-[1300px] !px-0 pb-4"
            headerClass="p-4"
          >
            <>
              <MediaBucket
                selectedMedia={selectedMedia}
                onSelected={(media) => {
                  onSelected && onSelected(media);
                  setClose();
                }}
              />
            </>
          </CustomModal>,
        );
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};
