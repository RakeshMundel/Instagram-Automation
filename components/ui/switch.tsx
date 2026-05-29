import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-12 w-[84px] shrink-0 cursor-pointer items-center rounded-lg border-2 border-transparent bg-[#9aa1cf] transition-colors data-[state=checked]:bg-primary",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-10 w-9 translate-x-1 rounded-md bg-white shadow transition-transform data-[state=checked]:translate-x-10",
      )}
    >
      <span className="mx-auto mt-2 block h-5 w-4 rounded-sm border-x-2 border-[#8fa0dc]" />
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;
