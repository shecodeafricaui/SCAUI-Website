import logo from "@/assets/sca-ui-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="She Code Africa UI Chapter logo"
      className={cn("h-10 w-10 rounded-full object-contain", className)}
    />
  );
}
