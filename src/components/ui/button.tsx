import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-base font-semibold shadow-sm ring-offset-background transition-base duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent text-background hover:bg-accent/90 hover:shadow-elevated focus:shadow-elevated",
        outline: "border border-border bg-transparent text-primary hover:bg-muted/40 hover:border-accent/60",
        secondary: "bg-muted text-primary hover:bg-section/80 border border-border/80",
        ghost: "hover:bg-muted/60 text-primary",
        link: "text-accent underline-offset-4 hover:underline",
        accent: "bg-accent text-background hover:bg-accent/80 focus:shadow-elevated",
      },
      size: {
        default: "h-11 min-h-[44px] px-6 py-2.5 rounded",
        sm: "h-9 min-h-[44px] px-4 py-2 rounded text-base",
        lg: "h-14 min-h-[44px] px-8 py-3 rounded text-lg",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] rounded p-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
