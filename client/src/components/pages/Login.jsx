import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Heart, Moon, Sun, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "../AuthContext";
import { Badge } from "../ui/badge";

export function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      await login(email, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors z-50"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <div className="flex-1 flex items-center justify-center p-8">
        {/* Left Side - Login Form */}
        <Card className="w-full max-w-md rounded-3xl border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <h2 className="text-gray-900 dark:text-white">LifeNet</h2>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome to LifeNet. Please sign in to continue.
                </p>
                <Badge className="bg-red-600 text-white hover:bg-red-600 rounded-lg">
                  Emergency
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Default credentials:{" "}
                <span className="text-blue-600 dark:text-blue-400">
                  admin@lifenet.com / admin
                </span>
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-900 dark:text-gray-100"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-12 mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <p className="text-center text-xs text-blue-600 dark:text-blue-400 mt-4">
                LifeNet — Smart Organ & Blood Network
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Welcome Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-black p-12 items-center justify-center">
        <div className="max-w-lg">
          <h1 className="text-white mb-6">Welcome to LifeNet</h1>
          <p className="text-gray-300 mb-12 leading-relaxed">
            Revolutionizing organ procurement and transplant management through
            digital innovation. Our platform streamlines the critical process of
            organ matching and transfer between medical centers, replacing
            manual processes with efficient digital workflows.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardContent className="p-6">
                <h3 className="text-white mb-4">Network Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>50+ Medical Centers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>200+ Successful Transfers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>24/7 Emergency Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-gray-800/50 border-gray-700 backdrop-blur">
              <CardContent className="p-6">
                <h3 className="text-white mb-4">Key Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Real-Time Matching</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Secure Data Transfer</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Priority System</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
