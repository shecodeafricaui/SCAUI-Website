import logo from "@/assets/SCA UI Logo1.png";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="She Code Africa UI Chapter logo"
      className={cn("h-10 w-10 rounded-full object-contain", className)}
    />
  );
}
