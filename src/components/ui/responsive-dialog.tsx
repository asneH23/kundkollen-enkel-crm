import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

interface BaseProps {
    children?: React.ReactNode;
}

export const ResponsiveDialog = ({
    children,
    open,
    onOpenChange,
}: React.ComponentProps<typeof Dialog>) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <Dialog open={open} onOpenChange={onOpenChange}>{children}</Dialog>;
    }

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            {children}
        </Drawer.Root>
    );
};

export const ResponsiveDialogTrigger = ({ children, asChild }: React.ComponentProps<typeof DialogTrigger>) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>;
    }

    return <Drawer.Trigger asChild={asChild}>{children}</Drawer.Trigger>;
};


export const ResponsiveDialogContent = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DialogContent>) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <DialogContent className={className} {...props}>
                {children}
            </DialogContent>
        );
    }

    return (
        <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
            <Drawer.Content
                className={cn(
                    "bg-white flex flex-col rounded-t-[10px] mt-24 fixed bottom-0 left-0 right-0 z-50 max-h-[96%] outline-none",
                    className
                )}
            >
                <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-auto">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                    {children}
                </div>
            </Drawer.Content>
        </Drawer.Portal>
    );
};

export const ResponsiveDialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const Comp = isDesktop ? DialogHeader : "div";
    return <Comp className={cn("text-left", className)} {...props} />;
};

export const ResponsiveDialogTitle = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogTitle>) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <DialogTitle className={className} {...props} />
    }

    return <Drawer.Title className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
};

export const ResponsiveDialogDescription = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogDescription>) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return <DialogDescription className={className} {...props} />
    }

    return <Drawer.Description className={cn("text-sm text-muted-foreground", className)} {...props} />
};

export const ResponsiveDialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const Comp = isDesktop ? DialogFooter : "div";
    return <Comp className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)} {...props} />
}
