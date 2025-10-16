import Image from "next/image";
import Link from "next/link";
import UserMenu from "./UserMenu";

interface AssistantHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
}

export default function AssistantHeader({ 
  showBackButton = true, 
  backHref = "/",
  backText = "Volver al inicio"
}: AssistantHeaderProps) {
  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/images/logoambiteca.png" alt="Ambitecapp" width={36} height={36} />
          <span className="font-semibold tracking-wide">AMBITECAPP</span>
        </div>
        <UserMenu />
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
