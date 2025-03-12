import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import UserAvatar from "./user-avatar";
import { Button } from "./ui/button";
import { Home, Settings, LogOut, Bell, PenSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  children,
  className,
  mobile = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  mobile?: boolean;
}) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-accent transition-colors",
        mobile && "w-full",
        className
      )}>
        {children}
      </a>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();

  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/" },
    {
      icon: <UserAvatar user={user!} />,
      label: "Profile",
      href: `/profile/${user?.id}`,
    },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col gap-6 border-r w-64 px-4 py-6 sticky top-0 h-screen">
        <Link href="/">
          <a className="px-4 font-bold text-xl">Social App</a>
        </Link>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 px-4"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 border-b bg-background/95 backdrop-blur z-50">
        <div className="flex h-14 items-center px-4 gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserAvatar user={user!} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-6">
                <Link href="/">
                  <a className="font-bold text-xl">Social App</a>
                </Link>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <NavLink key={item.href} href={item.href} mobile>
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-4"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/">
            <a className="font-bold text-xl">Social App</a>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:px-8 px-4 py-6 lg:py-8 min-h-screen lg:ml-64">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}