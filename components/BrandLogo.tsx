import Image from "next/image";

interface BrandLogoProps {
  variant?: "auth" | "icon" | "header";
  className?: string;
}

export function BrandLogo({ variant = "auth", className = "" }: BrandLogoProps) {
  if (variant === "icon") {
    return (
      <div
        className={`relative h-8 w-8 overflow-hidden rounded-md shrink-0 ${className}`}
      >
        <Image
          src="/hidd-wow-logo.png"
          alt="HiDD WoW"
          width={200}
          height={48}
          className="h-8 w-auto max-w-none absolute left-0 top-0"
          priority
        />
      </div>
    );
  }

  if (variant === "header") {
    return (
      <Image
        src="/hidd-wow-logo.png"
        alt="HiDD WoW"
        width={200}
        height={48}
        className={`h-8 w-auto rounded-md ${className}`}
        priority
      />
    );
  }

  return (
    <Image
      src="/hidd-wow-logo.png"
      alt="HiDD WoW"
      width={280}
      height={67}
      className={`h-14 w-auto rounded-lg ${className}`}
      priority
    />
  );
}
