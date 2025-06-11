import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Inputbox = React.forwardRef<HTMLInputElement, InputboxProps>(
  ({ className, label, type, ...props }, ref) => {
    return (
      <div className={cn("inputbox w-full", className)}>
        <input
          type={type}
          ref={ref}
          className="text-foreground"
          required={true}
          {...props}
        />
        {label && <span>{label}</span>}
        <i></i>
      </div>
    )
  }
)

Inputbox.displayName = "Inputbox"

export { Inputbox } 