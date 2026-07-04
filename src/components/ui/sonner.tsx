import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Custom, editorial-style notice. No default sonner card look:
// slim brand bar on the left, tight uppercase label, warm surface.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-left"
      offset={20}
      gap={10}
      duration={3200}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group relative flex w-[320px] max-w-[calc(100vw-32px)] items-start gap-3 overflow-hidden rounded-[4px] border border-border bg-surface px-4 py-3 pl-4 font-sans text-[13px] leading-5 text-foreground",
          title:
            "font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-brand-hover)]",
          description: "mt-0.5 text-[13px] leading-5 text-foreground",
          success:
            "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[color:var(--color-brand)]",
          error:
            "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[color:var(--color-cta)]",
          info: "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[color:var(--color-border-strong)]",
          closeButton:
            "!left-auto !right-2 !top-2 !bg-transparent !border-0 !text-[color:var(--color-text-muted)] hover:!text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
