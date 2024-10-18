import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { UploadFile } from "./upload-file";
import { useFetcher } from "@remix-run/react";
import { DeleteApiResponse } from "cloudinary";
import { CheckIcon, Loader } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { getSmallImageUrl } from "~/lib/utils";
import { cn, useMatchesData } from "~/utils";
import { Button } from "../ui/button";
import { Media } from "@prisma/client";
import { format } from "date-fns";
import { FileIcon } from "@radix-ui/react-icons";
import { AdminLayoutData } from "~/routes/admin";

export const MediaBucket = ({
  onSelected,
  selectedMedia,
}: {
  selectedMedia?: Media;
  onSelected?: (item: Media) => void;
}) => {
  const [item, setItem] = useState<null | Media>(null);
  const fetcherDelete = useFetcher<DeleteApiResponse>();
  const { media, user } = useMatchesData<AdminLayoutData>("routes/admin");

  return (
    <div>
      <Tabs defaultValue="library" className="">
        <TabsList className="ml-4">
          <TabsTrigger value="upload">Upload file</TabsTrigger>
          <TabsTrigger value="library">Media library</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="w-full min-h-[330px] px-4">
          <UploadFile />
        </TabsContent>
        <TabsContent value="library" className="w-full ">
          <div className="flex flex-col">
            <div className="overflow-auto border-t border-b-2 border-gray-400 h-[330px]">
              {fetcher.state === "loading" && (
                <div className="flex items-center justify-center min-h-[200px]">
                  <Loader className="w-4 h-4  animate-spin" />
                </div>
              )}
              {fetcher.data && fetcher.state !== "loading" && (
                <div className="flex justify-between gap-2 h-full items-stretch">
                  <div className="flex flex-wrap flex-1 min-w-[100px] gap-4 py-4 px-4 h-full overflow-auto">
                    {fetcher.data.map((r) => (
                      <MediaItem
                        key={r.id}
                        data={r as unknown as Media}
                        onClick={() => setItem(r as unknown as Media)}
                        isChoosen={
                          item
                            ? r.id === item.id
                            : selectedMedia
                              ? selectedMedia.id === r.id
                              : false
                        }
                      />
                    ))}
                    {fetcher.data.length === 0 && (
                      <div className="col-span-full ">Bucket is empty.</div>
                    )}
                  </div>
                  <div className="bg-gray-100 hidden md:block w-[40%] p-4 h-full">
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
                            <p className="font-bold overflow-hidden truncate">
                              {item.displayName}
                            </p>
                            <p>
                              Created at :{" "}
                              {format(item.createdAt, "HH:ii:ss dd/MM/yyyy")}
                            </p>
                            <p>
                              {item.width} x {item.height}
                            </p>
                            <fetcherDelete.Form
                              action={`/api/media/delete?id=${item?.id}`}
                              method="delete"
                            >
                              <Button
                                type="submit"
                                variant={"link"}
                                className="px-0 text-destructive"
                                disabled={
                                  !item || fetcherDelete.state === "submitting"
                                }
                              >
                                Delete this file
                              </Button>
                            </fetcherDelete.Form>
                          </div>
                        </div>
                        <UpdateForm
                          media={item}
                          key={item.id}
                          onUploaded={() => fetcher.load("/api/media/getAll")}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end justify-end gap-2 sm:flex-row ml-auto pt-2.5 w-full px-4">
              <Button
                onClick={() => item && onSelected && onSelected(item)}
                disabled={!item || fetcherDelete.state === "submitting"}
                className=""
              >
                Use selected file
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
          src={getSmallImageUrl(data.url, 500, 500)}
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
  const [caption, setCaption] = useState(media.caption ?? "");
  const [altText, setAltText] = useState(media.altText ?? "");
  const [description, setDescription] = useState(media.description ?? "");

  const formRef = useRef<HTMLFormElement | null>(null);
  const handleUpdate: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current ?? undefined);
    const rs = await fetch("/api/media/update", {
      method: "post",
      body: formData,
    });
    const result = (await rs.json()) as {
      success: boolean;
      error: string | null;
    };

    rs.ok &&
      onUploaded &&
      onUploaded({ ...media, caption, altText, description });
  };

  return (
    <form
      ref={formRef}
      className="mt-4 space-y-4 max-w-[400px]"
      onSubmit={handleUpdate}
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
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
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
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-2 py-1"
            rows={4}
          ></textarea>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          className="w-fit bg-secondary text-secondary-foreground hover:bg-secondary-foreground hover:text-white "
        >
          Update Media
        </Button>
      </div>
    </form>
  );
};
