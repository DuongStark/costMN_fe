import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-purple-400 selection:bg-purple-200 selection:text-purple-800 border-input flex h-10 w-full min-w-0 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 px-4 py-2.5 text-base shadow-md transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-purple-400 focus-visible:ring-purple-300/40 focus-visible:ring-4 focus-visible:bg-gradient-to-br focus-visible:from-rose-100 focus-visible:via-pink-100 focus-visible:to-purple-100 focus-visible:shadow-lg focus-visible:scale-[1.02]",
        "aria-invalid:ring-red-300/40 aria-invalid:border-red-400 aria-invalid:ring-4",
        className
      )}
      {...props}
    />
  )
}

export { Input }
