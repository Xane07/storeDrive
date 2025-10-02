"use client";

import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useState } from "react";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModelOpe, setisModelOpe] = useState(false);
  const [isDropdownOpen, setisDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  return (
    <>
      <Dialog open={isModelOpe} onOpenChange={setisModelOpe}>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setisDropdownOpen}>
          <DropdownMenuTrigger className="shad-no-focus">
            <Image src="/assets/icons/dots.svg" alt="dots" width={34} height={34} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="max-w-[200px] truncate">{file.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actionsDropdownItems.map((item) => (
              <DropdownMenuItem
                key={item.value}
                className="shad-dropdown-item"
                onClick={() => setAction(item)}
              >
                <Image src={item.icon} alt={item.label} width={24} height={24} />
                <p className="body-2">{item.label}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Dialog>
    </>
  );
};

export default ActionDropdown;
