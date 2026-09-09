"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast 
            key={id} 
            variant={variant} 
            {...props} 
            className="p-4 pr-10 transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              {variant === "destructive" && (
                <div className="shrink-0">
                  <AlertCircleIcon className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="grid gap-1">
                {title && (
                  <ToastTitle className={cn(
                    "text-sm font-bold",
                    variant === "destructive" ? "text-white" : "text-gray-800"
                  )}>
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className={cn(
                    "text-sm", 
                    variant === "destructive" ? "text-white/90" : "text-gray-600"
                  )}>
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose 
              className={cn(
                "absolute right-2 top-2 rounded-md p-1 transition-all duration-200",
                variant === "destructive" 
                  ? "text-white/80 hover:text-white hover:bg-purple-500/20 focus:ring-white/50" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )} 
            />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-0 right-0 z-[100] flex max-h-screen flex-col-reverse p-4 sm:max-w-[420px] gap-2" />
    </ToastProvider>
  )
} 