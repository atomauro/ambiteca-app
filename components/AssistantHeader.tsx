import Image from "next/image";
import Link from "next/link";
import UserMenu from "./UserMenu";

interface AssistantHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
}

export default function AssistantHeader({ 
  showBackButton = false, 
  backHref = "/",
  backText = "Volver al inicio"
}: AssistantHeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              {/* Logo simplificado para header unificado */}
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="text-xl font-bold text-foreground">AMBITECAPP</span>
          </div>
          <UserMenu />
        </div>
      </header>

      {showBackButton && (
        <div className="mt-4">
          <Link href={backHref} className="text-sm underline hover:text-green-600 transition-colors">
            {backText}
          </Link>
        </div>
      )}
    </>
  );
}
