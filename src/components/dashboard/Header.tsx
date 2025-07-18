"use client";
import type React from "react";
import { Bot, Moon, Sun, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/redux/store"; // Correct import path
import { useRouter } from "next/navigation"; // Import useRouter
import { logout } from "@/lib/redux/slices/user"; // Import logout action
import { persistor } from "@/lib/redux/store"; // Import persistor for purging state
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useSelector((state: RootState) => state.user) as {
    user: { firstName?: string; email?: string };
  };
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    dispatch(logout()); // Dispatch the logout action to clear Redux state
    await persistor.purge(); // Clear persisted state from storage
    router.push("/login"); // Redirect to login page
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 w-full">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">AI Interviewer</h1>
                  <p className="text-xs text-muted-foreground">Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-muted rounded-md animate-pulse" />
              <div className="w-9 h-9 bg-muted rounded-md animate-pulse" />
              <div className="w-9 h-9 bg-muted rounded-md animate-pulse" />
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 w-full">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">AI Interviewer</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9 cursor-pointer"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                2
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-auto px-3 flex items-center space-x-3 pl-3 border-l cursor-pointer"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium capitalize">
                      {user.firstName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.firstName
                        ? user.firstName.charAt(0).toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
