"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, CircleAlert } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { login } from "@/services/operations/auth";
import { useDispatch } from "react-redux";
import { addToken, addUser } from "@/lib/redux/slices/user";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const router = useRouter();
  const dispatch=useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      console.log("Login attempt:", formData);
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      if (response) {
        dispatch(addToken(response.token));
        dispatch(addUser(response.user))
        
        setSuccess("Login successful! Redirecting to dashboard...");
        console.log("user logged in");

        // Redirect after showing success message
        setTimeout(() => {
          const role = response.user.role;
          if(role==="applicant"){
            router.push("/candidate-dashboard");
          } else {
            router.push("/hr-dashboard");
          }
        }, 1500);
      }
    } catch (error: any) {
      console.error(error);
      setError(
        error.message ||
          "Invalid credentials. Please check your email and password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google login
    console.log("Google login");
  };

  return (
    <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50 dark:bg-slate-900 min-h-[60vh] lg:min-h-screen border-l border-gray-200 dark:border-slate-700 lg:border-l lg:border-t-0 border-t lg:border-t-0">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg border border-gray-300 dark:border-slate-600 flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-white dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="text-center pb-6 sm:pb-8">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Sign In
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-2">
            Access your AI interviewer dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex justify-between items-center">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  Error in Logging In
                </p>
                <CircleAlert className="w-6 h-6 text-red-800" />
              </div>
            )}

            {success && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  {success}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 dark:text-slate-300"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-11 sm:h-12 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 dark:text-white dark:placeholder-slate-400"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 dark:text-slate-300"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-11 sm:h-12 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 pr-12 dark:text-white dark:placeholder-slate-400"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <Separator className="my-6 dark:bg-slate-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-4 bg-white dark:bg-slate-800 text-sm text-gray-500 dark:text-slate-400">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-11 sm:h-12 border-2 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 rounded-xl cursor-pointer dark:bg-slate-800 dark:text-white bg-white"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-gray-600 dark:text-slate-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
