import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      className="toaster group"
      duration={4000}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-elevated group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:gap-3",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm",
          closeButton: "group-[.toast]:bg-transparent group-[.toast]:text-muted-foreground group-[.toast]:border-0 group-[.toast]:hover:bg-muted group-[.toast]:rounded-md",
          success: "group-[.toaster]:bg-success/10 group-[.toaster]:border-success/20 group-[.toaster]:text-success-foreground [&>svg]:text-success",
          error: "group-[.toaster]:bg-destructive/10 group-[.toaster]:border-destructive/20 group-[.toaster]:text-destructive-foreground [&>svg]:text-destructive",
          warning: "group-[.toaster]:bg-warning/10 group-[.toaster]:border-warning/20 group-[.toaster]:text-warning-foreground [&>svg]:text-warning",
          info: "group-[.toaster]:bg-info/10 group-[.toaster]:border-info/20 group-[.toaster]:text-info-foreground [&>svg]:text-info",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
