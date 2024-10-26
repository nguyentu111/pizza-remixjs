import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { UploadFile } from "./upload-file";
import { useFetcher } from "@remix-run/react";
import { DeleteApiResponse } from "cloudinary";
import { CheckIcon, Loader } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { bytesToMB, getSmallImageUrl } from "~/lib/utils";
import { cn, useMatchesData } from "~/lib/utils";
import { Button } from "../ui/button";
import { Media, MediaType } from "@prisma/client";
import { format } from "date-fns";
import { FileIcon } from "@radix-ui/react-icons";
import { AdminLayoutData } from "~/routes/admin";
import { ActionResultType } from "~/lib/type";
import { useModal } from "../providers/modal-provider";
import { useForm } from "~/hooks/use-form";

export const MediaBucket = ({
  onSelected,
  onCancled,
  selectedMedia,
  mediaType,
}: {
  mediaType: MediaType;
  selectedMedia?: string;
  onSelected?: (item: Media) => void;
  onCancled?: () => void;
}) => {
  const { media, staff } = useMatchesData<AdminLayoutData>("routes/admin");
  const [item, setItem] = useState<Media | undefined>(
    media.find((m) => m.url === selectedMedia),
  );
  const { fetcher: fetcherDelete } = useForm();
  const { setClose } = useModal();
  return (
    <div>
      <Tabs defaultValue="library" className="">
        <TabsList className="ml-4">
          <TabsTrigger value="upload">Tải lên</TabsTrigger>
          <TabsTrigger value="library">Thư viện</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="w-full min-h-[330px] px-4">
          <UploadFile mediaType={mediaType} />
        </TabsContent>
        <TabsContent value="library" className="w-full ">
          <div className="flex flex-col">
            <div className="overflow-auto border-t border-b-2 border-gray-400 h-[330px]">
              <div className="flex justify-between gap-2 h-full items-stretch">
                <div className="flex flex-wrap flex-1 min-w-[100px] gap-4 py-4 px-4 h-full overflow-auto">
                  {media.map(
                    (r) =>
                      r.type === mediaType && (
                        <MediaItem
                          key={r.id}
                          data={r as unknown as Media}
                          onClick={() => setItem(r as unknown as Media)}
                          isChoosen={
                            item
                              ? r.id === item.id
                              : selectedMedia
                                ? selectedMedia === r.publicId
                                : false
                          }
                        />
                      ),
                  )}
                  {media.length === 0 && (
                    <div className="col-span-full ">Kho thư viện trống.</div>
                  )}
                </div>
                <div className="overflow-y-auto w-[40%] overflow-x-hidden py-4">
                  {item && (
                    <div>
                      <div className="flex gap-2">
                        {item.format === "jpg" ||
                        item.format === "png" ||
                        item.format === "gif" ||
                        item.format === "svg" ? (
                          <img
                            src={getSmallImageUrl(item.url)}
                            className="w-[200px] h-[100px] object-contain"
                          />
                        ) : (
                          <div className="text-center w-[200px] h-[100px] border-2 border-black flex items-center justify-center">
                            <FileIcon className="w-10 h-10" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold overflow-hidden line-clamp-1 max-w-[300px]">
                            {item.displayName}
                          </p>
                          <p>
                            Tạo lúc :{" "}
                            {format(item.createdAt, "HH:ii:ss dd/MM/yyyy")}
                          </p>
                          {item.width && item.height && (
                            <p>
                              {item.width} x {item.height}
                            </p>
                          )}
                          <p>{bytesToMB(item.bytes)} MB</p>
                          <fetcherDelete.Form
                            action={`/admin?id=${item?.id}`}
                            method="delete"
                          >
                            <Button
                              name="_action"
                              value={"delete-media"}
                              type="submit"
                              variant={"link"}
                              className="px-0 text-destructive"
                              disabled={
                                !item || fetcherDelete.state === "submitting"
                              }
                            >
                              Xóa file này
                            </Button>
                          </fetcherDelete.Form>
                        </div>
                      </div>
                      <UpdateForm media={item} key={item.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex  items-end justify-end gap-2 sm:flex-row ml-auto pt-2.5 w-full px-4">
              <Button
                onClick={() => {
                  setClose();
                  onCancled && onCancled();
                }}
                className=""
                variant={"outline"}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  setClose();
                  item && onSelected && onSelected(item);
                }}
                disabled={!item || fetcherDelete.state === "submitting"}
                className=""
              >
                Dùng file đã chọn
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MediaItem = ({
  data,
  onClick,
  isChoosen,
}: {
  data: Media;
  onClick?: () => void;
  isChoosen: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-md border-4 relative select-none aspect-square w-28 h-28",
        isChoosen && "border-blue-500 ",
      )}
    >
      {data.format === "jpg" ||
      data.format === "png" ||
      data.format === "gif" ||
      data.format === "svg" ? (
        <img
          className="w-full h-[100px] object-cover"
          src={getSmallImageUrl(data.url)}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <FileIcon className="w-10 h-10" />
        </div>
      )}
      {isChoosen && (
        <div className="absolute bottom-0 right-0 border-2 border-blue-500 bg-white ring-2 ring-offset-0 ring-white">
          <CheckIcon className="w-4 h-4 text-blue-500" />
        </div>
      )}
    </div>
  );
};

const UpdateForm = ({
  media,
  onUploaded,
}: {
  media: Media;
  onUploaded?: (media: Media) => void;
}) => {
  const { fetcher } = useForm();
  return (
    <fetcher.Form
      className="mt-4 space-y-4 max-w-[400px]"
      action="/admin"
      method="post"
    >
      <input type="hidden" name="id" value={media.id} />
      <div className="flex gap-4">
        <div className="">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Caption:
            </label>
            <input
              type="text"
              name="caption"
              defaultValue={media.caption ?? ""}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alt Text:
            </label>
            <input
              type="text"
              name="altText"
              defaultValue={media.altText ?? ""}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description:
          </label>
          <textarea
            name="description"
            defaultValue={media.description ?? ""}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1"
            rows={4}
          ></textarea>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          name="_action"
          value={"update-media"}
          type="submit"
          className="w-fit bg-secondary text-secondary-foreground hover:bg-secondary-foreground hover:text-white "
        >
          Update Media
        </Button>
      </div>
    </fetcher.Form>
  );
};
