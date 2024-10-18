"use client";
import { useModal } from "~/components/providers/modal-provider";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "~/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { cn } from "~/lib/utils";

type Props = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  contentClass?: string;
  headerClass?: string;
  descriptionClass?: string;
};

const CustomModal = ({
  children,
  defaultOpen,
  subheading,
  title,
  contentClass,
  descriptionClass,
  headerClass,
}: Props) => {
  const { isOpen, setClose } = useModal();
  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent
        className={cn(
          contentClass,
          "!max-h-[80vh] overflow-auto !rounded-none border border-primary bg-card",
        )}
      >
        <DialogHeader className={cn("text-left", headerClass)}>
          <DialogTitle className={cn("font-amatic text-4xl font-bold")}>
            {title}
          </DialogTitle>

          <DialogDescription
            className={cn("font-special text-md", descriptionClass)}
          >
            {subheading}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
