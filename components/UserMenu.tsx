import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePrivy } from "@privy-io/react-auth";

export default function UserMenu() {
  const { user, logout } = usePrivy();
  const avatarUrl = (user as any)?.google?.profilePictureUrl || (user as any)?.apple?.profilePictureUrl || "/images/avatar.png";
  const displayName = (user as any)?.google?.name || (user as any)?.apple?.name || ((user as any)?.email?.address ? (user as any)?.email?.address.split('@')[0] : 'Usuario');
  const emailAddr = (user as any)?.email?.address || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{(displayName || 'U').slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start leading-tight">
            <span className="text-sm font-medium max-w-[160px] truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground max-w-[180px] truncate">{emailAddr}</span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{(displayName || 'U').slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium leading-none">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[160px]">{emailAddr}</div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile"><DropdownMenuItem className="cursor-pointer">Perfil</DropdownMenuItem></Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={async () => { try { localStorage.removeItem('lastRole'); await logout(); window.location.href = '/'; } catch(e) { console.error(e);} }}>Cerrar sesión</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


