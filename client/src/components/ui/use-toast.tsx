import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ToastActionElement, ToastProps } from "@/components/ui/toast";

interface ToastFormProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: ToastActionElement;
}

export function useToastForm() {
  const { toast } = useToast();

  return {
    onSubmit: ({ title, description, variant, action }: ToastFormProps) => {
      toast({
        title,
        description,
        variant,
        action,
      });
    },
  };
}
