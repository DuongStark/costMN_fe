import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-opacity-20 letter-spacing-wide",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-pink-400 via-purple-400 to-rose-400 text-white shadow-lg hover:from-pink-500 hover:via-purple-500 hover:to-rose-500 hover:shadow-xl hover:scale-105 focus-visible:ring-pink-200",
        destructive:
          "bg-gradient-to-br from-red-400 via-rose-400 to-pink-400 text-white shadow-lg hover:from-red-500 hover:via-rose-500 hover:to-pink-500 hover:shadow-xl hover:scale-105 focus-visible:ring-red-200",
        outline:
          "border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 text-purple-700 shadow-md hover:from-purple-100 hover:via-pink-100 hover:to-rose-100 hover:border-purple-300 hover:shadow-lg hover:scale-105 focus-visible:ring-purple-200",
        secondary:
          "bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-300 text-amber-800 shadow-lg hover:from-yellow-400 hover:via-amber-400 hover:to-orange-400 hover:shadow-xl hover:scale-105 focus-visible:ring-yellow-200",
        ghost:
          "text-purple-600 hover:bg-gradient-to-br hover:from-purple-100 hover:via-pink-100 hover:to-rose-100 hover:text-purple-700 hover:scale-105 focus-visible:ring-purple-200",
        link: "text-purple-600 underline-offset-4 hover:underline hover:text-purple-700 focus-visible:ring-purple-200",
        feminine:
          "bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300 text-purple-800 shadow-lg hover:from-rose-400 hover:via-pink-400 hover:to-purple-400 hover:shadow-xl hover:scale-105 focus-visible:ring-rose-200",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-8 rounded-lg gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-7 text-base has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
