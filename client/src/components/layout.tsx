import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import UserAvatar from "./user-avatar";
import { Button } from "./ui/button";
import { Home, User, LogOut } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container flex h-14 items-center">
          <nav className="flex flex-1 items-center gap-6 text-sm">
            <Link href="/">
              <a className="font-bold text-xl">Social App</a>
            </Link>
            <div className="flex-1" />
            {user && (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/">
                    <Home className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/profile/${user.id}`}>
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/settings">
                    {/* Added Settings link */}
                    <span className="h-5 w-5">Settings</span> {/* Placeholder icon */}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                <UserAvatar user={user} />
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}