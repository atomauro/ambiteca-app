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
              {/* Igual que admin: ícono Recycle */}
              <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M3 16v5h5"/><path d="M21 16v5h-5"/><path d="M21 8a13.16 13.16 0 0 1-5.17 8.5L12 21l-3.83-4.5A13.16 13.16 0 0 1 3 8"/></svg>
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
