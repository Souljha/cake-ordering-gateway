import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

interface CakeDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const CakeDialog: React.FC<CakeDialogProps> = ({
  trigger,
  title,
  description,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter>
          <Button variant="outline" className="mr-2">
            {cancelText}
          </Button>
          {onConfirm && (
            <Button onClick={onConfirm}>{confirmText}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};