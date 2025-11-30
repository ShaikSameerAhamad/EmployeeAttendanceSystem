import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] purple-glow",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-xl active:scale-[0.98]",
        outline:
          "border-2 border-accent/50 bg-transparent text-accent shadow-sm hover:bg-accent/10 hover:border-accent active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 active:scale-[0.98]",
        ghost: "hover:bg-white/10 hover:text-white active:scale-[0.98]",
        link: "text-accent underline-offset-4 hover:underline hover:text-accent/80",
        success:
          "bg-success text-success-foreground shadow-lg hover:bg-success/90 hover:shadow-xl active:scale-[0.98]",
        warning:
          "bg-warning text-warning-foreground shadow-lg hover:bg-warning/90 hover:shadow-xl active:scale-[0.98]",
        gradient:
          "bg-gradient-to-r from-primary via-accent to-primary text-white shadow-xl hover:shadow-2xl hover:shadow-accent/30 active:scale-[0.98] purple-glow",
        glass:
          "glass-effect text-foreground shadow-lg hover:bg-card/90 active:scale-[0.98]",
        checkin:
          "bg-gradient-to-r from-success to-success/80 text-white shadow-xl hover:shadow-2xl hover:shadow-success/30 active:scale-[0.98]",
        checkout:
          "bg-gradient-to-r from-destructive to-destructive/80 text-white shadow-xl hover:shadow-2xl hover:shadow-destructive/30 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
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
