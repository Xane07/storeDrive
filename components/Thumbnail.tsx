import React from "react";
import Image from "next/image";
import { cn, getFileIcon, getFileType } from "@/lib/utils";
interface Props {
  type: string;
  url?: string;
  extension: string;
  imageClassName?: string;
  className?: string;
}

const Thumbnail = ({
  type,
  extension,
  url,
  imageClassName,
  className = "",
}: Props) => {
  const isImage = type === "image" && extension !== "png";
  return (
    <figure className={cn("thumbnail", className)}>
      <Image
        src={isImage ? url : getFileIcon(extension, type)}
        alt="thumbnail"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "thumbnail-image"
        )}
      />
    </figure>
  );
};
export default Thumbnail;
