import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { UploadFile } from "./upload-file";
import { useFetcher } from "@remix-run/react";
import { DeleteApiResponse } from "cloudinary";
import { CheckIcon, Loader } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { getSmallImageUrl } from "~/lib/utils";
import { cn } from "~/utils";
import { Button } from "../ui/button";
import { Media } from "@prisma/client";
import { format } from "date-fns";
export const MediaBucket = ({
  onSelected,
}: {
  onSelected: (item: Media) => void;
}) => {
  const [item, setItem] = useState<null | Media>(null);
  const fetcher = useFetcher<Media[]>();
  const fetcherDelete = useFetcher<DeleteApiResponse>();
  useLayoutEffect(() => {
    fetcher.load("/api/media/getAll");
  }, []);
  console.log(fetcher.data);

  return (
    <div>
      <Tabs defaultValue="library" className="">
        <TabsList className="ml-4">
          <TabsTrigger value="upload">Upload file</TabsTrigger>
          <TabsTrigger value="library">Media library</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="w-full min-h-[330px] px-4">
          <UploadFile onUploaded={() => fetcher.load("/api/media/getAll")} />
        </TabsContent>
        <TabsContent value="library" className="w-full ">
          <div className="flex flex-col">
            <div className="  overflow-auto border-t border-b-2 border-gray-400 h-[330px]">
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
                        isChoosen={r.id === item?.id}
                      />
                    ))}
                    {fetcher.data.length === 0 && (
                      <div className="col-span-full ">Bucket is empty.</div>
                    )}
                  </div>
                  <div className="bg-gray-100 hidden md:block min-w-[40%] p-4 h-full">
                    {item && (
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
                          <div className="text-center w-[200px] h-[100px] border-2 border-black">
                            {item.format}
                          </div>
                        )}
                        <div>
                          <p className="font-bold overflow-hidden truncate">
                            {item.displayName}.{item.format}
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
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end justify-end gap-2 sm:flex-row ml-auto pt-2.5 w-full px-4">
              <Button
                onClick={() => item && onSelected(item)}
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
        <div className="text-center h-full">{data.format}</div>
      )}
      {isChoosen && (
        <div className="absolute bottom-0 right-0 border-2 border-blue-500 bg-white ring-2 ring-offset-0 ring-white">
          <CheckIcon className="w-4 h-4 text-blue-500" />
        </div>
      )}
    </div>
  );
};
