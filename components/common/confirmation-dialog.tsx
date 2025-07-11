"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: "default" | "destructive"
  onConfirm: () => void
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "default",
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !isLoading && onOpenChange(open)}>
      <AlertDialogContent className="bg-background text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="bg-input text-input-text">{cancelText}</AlertDialogCancel>
          {isLoading ? (
            <Button
              disabled
              className={
                variant === "destructive" ? "bg-red-600 text-gray-800 hover:bg-red-600/65" : ""
              }
            >
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {confirmText}...
            </Button>
          ) : (
            <AlertDialogAction
              onClick={onConfirm}
              className={
                variant === "destructive" ? "bg-red-600 text-gray-800 hover:bg-red-600/65" : ""
              }
            >
              {confirmText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
