"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";

import Premium from "../../public/premium.svg";
import Image from "next/image";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpgradeModal = ({ open, onOpenChange }: UpgradeModalProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-primary/20 shadow-2xl">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center ">
            <Image src={Premium} alt="Premium" width={64} height={64} />
          </div>
          <AlertDialogTitle className="text-center text-2xl font-bold text-primary">
            Upgrade to Pro
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base leading-relaxed">
            You need an active subscription to perform this action. Upgrade to
            Pro to unlock all features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2 mt-2">
          <AlertDialogAction
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => authClient.checkout({ slug: "pro" })}
          >
            Upgrade Now
          </AlertDialogAction>
          <AlertDialogCancel className="w-full border-border hover:bg-accent hover:text-accent-foreground py-6 font-medium">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
