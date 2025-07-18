import { Sparkles, Target, Rocket, Bot } from "lucide-react";
import FloatingElements from "./FloatingElements";
// import { ThemeToggle } from "@/components/theme-toggle";

const BrandSection = () => {
  const features = [
    { icon: Sparkles, text: "Smart interview analytics" },
    { icon: Target, text: "Personalized candidate insights" },
    { icon: Rocket, text: "Streamlined hiring process" },
  ];

  return (
    <div className="relative flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-[40vh] lg:min-h-screen">
      <FloatingElements />

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url(&quot;data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'><path d='M 10 0 L 0 0 0 10' fill='none' stroke='rgba(255,255,255,0.1)' strokeWidth='0.5'/></pattern></defs><rect width='100' height='100' fill='url(%23grid)'/></svg>&quot;)] opacity-30"></div>

      <div className="relative z-10 max-w-md text-center text-white">
        {/* Logo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
          <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        {/* Main Content */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          Welcome Back!
        </h1>
        <p className="text-lg sm:text-xl opacity-90 mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0">
          Continue your journey with AI-powered interviews that transform
          hiring.
        </p>

        {/* Features */}
        <div className="space-y-3 sm:space-y-4 text-left">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 text-white/95"
            >
              <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSection;
