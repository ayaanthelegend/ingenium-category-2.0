import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-white/40 placeholder:text-white/40 selection:bg-primary selection:text-primary-foreground bg-primary/20 border-primary/30 flex h-9 w-full min-w-0 rounded-full border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

type InputWithIconProps = React.ComponentProps<"input"> & {
  icon: React.ReactNode;
};

function InputWithIcon({ icon, className, ...props }: InputWithIconProps) {
  return (
    <div className="relative w-64">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/40">
        {icon}
      </div>
      <Input className={`pl-10 ${className}`} {...props} />
    </div>
  );
}

export { Input, InputWithIcon }
