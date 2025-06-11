import * as React from "react"
import { cn } from "@/lib/utils"

export interface LiquidSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const LiquidSwitch = React.forwardRef<HTMLInputElement, LiquidSwitchProps>(
  ({ className, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(event.target.checked)
      }
    }

    return (
      <input
        type="checkbox"
        role="switch"
        className={cn("liquid-switch", className)}
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

LiquidSwitch.displayName = "LiquidSwitch"

export { LiquidSwitch } 