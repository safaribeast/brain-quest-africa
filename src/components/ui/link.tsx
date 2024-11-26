import NextLink from "next/link"
import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export interface LinkProps extends ComponentProps<typeof NextLink> {
  className?: string
}

export function Link({ className, ...props }: LinkProps) {
  return (
    <NextLink
      className={cn(
        "text-primary underline-offset-4 hover:underline",
        className
      )}
      {...props}
    />
  )
} 