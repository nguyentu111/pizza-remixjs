import { Media } from "@prisma/client";
import { useModal } from "../providers/modal-provider";
import { Button, ButtonProps } from "../ui/button";
import CustomModal from "./custom-modal";
import { MediaBucket } from "./media-bucket";
interface Props extends ButtonProps {
  onSelected: (media: Media) => void;
}
export const MediaButton = ({ onSelected, children, ...rest }: Props) => {
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
                onSelected={(media) => {
                  onSelected(media), setClose();
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
