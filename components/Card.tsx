import React from "react";
import { Models } from "node-appwrite";
import Link from "next/link";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "@/components/FormattedDateTime";

const Card = ({ file }: { file: Models.Document }) => {
  return (
    <Link
      href={file.url}
      target="_blank"
      className="file-card overflow-hidden min-h-[140px]"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Thumbnail
            type={file.type}
            extension={file.extension}
            url={file.url}
            className="!size-24 rounded-full"
            imageClassName="!size-14 rounded-full"
          />
          <p className="subtitle-1 line-clamp-2 break-words min-w-0 flex-1">
            {file.name}
          </p>
        </div>
        <div className="flex flex-col items-end justify-between shrink-0">
          {/* ActionsDropdown */}
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>
      <div className="file-card-details">
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-100"
        />
        <p className="caption line-clamp-1 text-light-200">
          By: {file.owner.fullName}
        </p>
      </div>
    </Link>
  );
};
export default Card;
