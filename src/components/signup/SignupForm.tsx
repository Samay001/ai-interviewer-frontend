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
import { Eye, EyeOff, Loader2, CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/services/operations/auth";

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    phoneNumber: "",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Signup attempt:", formData);
      const response = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });

      setSuccess("Account created successfully! Redirecting to login...");

      // Redirect after showing success message
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error(error);
      setError(
        error.message || "An error occurred during signup. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Handle Google signup
    console.log("Google signup");
  };

  const roles = [
    {
      id: 0,
      role: "HR Manager",
      value: "admin",
    },
    {
      id: 1,
      role: "Applicant",
      value: "applicant",
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50 dark:bg-slate-900 overflow-y-auto min-h-[60vh] lg:min-h-screen">
      <Card className="w-full max-w-md shadow-xl border-0 my-4 sm:my-8 bg-white dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-slate-300 mt-2">
            Start your AI-powered hiring journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 sm:space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Error and Success Messages */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex justify-between items-center">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  Error in Signing Up
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
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-semibold text-gray-700 dark:text-slate-300"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="h-10 sm:h-11 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 dark:text-white dark:placeholder-slate-400"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-semibold text-gray-700 dark:text-slate-300"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="h-10 sm:h-11 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 dark:text-white dark:placeholder-slate-400"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="h-10 sm:h-11 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 dark:text-white dark:placeholder-slate-400"
                required
                disabled={isLoading}
              />
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="text-sm font-semibold text-gray-700 dark:text-slate-300"
              >
                Phone number
              </Label>
              <Input
                id="phoneNumber"
                placeholder="Your Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="h-10 sm:h-11 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 dark:text-white dark:placeholder-slate-400"
                required
                disabled={isLoading}
              />
            </div>

            {/* Role */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full h-10 sm:h-11 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-600 dark:text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                    {roles.map((role) => (
                      <SelectItem
                        key={role.id}
                        value={role.value}
                        className="dark:text-white dark:focus:bg-slate-700"
                      >
                        {role.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-10 sm:h-11 bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 pr-12 dark:text-white dark:placeholder-slate-400"
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
                    <EyeOff className="w-5 h-5 cursor-pointer" />
                  ) : (
                    <Eye className="w-5 h-5 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) =>
                  setAgreedToTerms(checked as boolean)
                }
                className="mt-0.5 dark:border-slate-600 dark:data-[state=checked]:bg-purple-600 cursor-pointer"
                disabled={isLoading}
              />
              <Label
                htmlFor="terms"
                className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 mt-6 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <Separator className="my-6 dark:bg-slate-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-4 bg-white dark:bg-slate-800 text-sm text-gray-500 dark:text-slate-400">
                or sign up with
              </span>
            </div>
          </div>

          {/* Google Sign Up */}
          <Button
            onClick={handleGoogleSignup}
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

          {/* Sign In Link */}
          <div className="text-center text-gray-600 dark:text-slate-300">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
