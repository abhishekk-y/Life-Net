import { Link } from "react-router-dom";
import {
  Heart,
  Users,
  Activity,
  TrendingUp,
  ArrowRight,
  Droplets,
  Building2,
  Clock,
  Shield,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { useTheme } from "../ThemeProvider";

const stats = [
  { value: "50+", label: "Medical Centers", icon: Building2 },
  { value: "200+", label: "Lives Saved", icon: Heart },
  { value: "1,842", label: "Blood Units", icon: Droplets },
  { value: "99.8%", label: "Success Rate", icon: TrendingUp },
];

const features = [
  {
    icon: Clock,
    title: "Real-Time Matching",
    description:
      "Instantly match donors and recipients with our advanced AI-powered algorithm.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "HIPAA-compliant platform ensuring complete data security and privacy.",
  },
  {
    icon: Activity,
    title: "24/7 Monitoring",
    description:
      "Round-the-clock system monitoring for emergency organ procurement.",
  },
  {
    icon: Users,
    title: "Network Collaboration",
    description:
      "Connect with medical centers nationwide for better patient outcomes.",
  },
];

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Chief Surgeon, Central Hospital",
    content:
      "LifeNet has revolutionized how we handle organ procurement. The efficiency gains are remarkable.",
    avatar: "👩‍⚕️",
  },
  {
    name: "Dr. Michael Chen",
    role: "Transplant Coordinator",
    content:
      "The real-time matching system has reduced our wait times by 40%. This platform saves lives.",
    avatar: "👨‍⚕️",
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Blood Bank Director",
    content:
      "Managing blood inventory has never been easier. The analytics help us maintain optimal stock levels.",
    avatar: "👩‍⚕️",
  },
];

export function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="text-gray-900 dark:text-white">LifeNet</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Contact
              </a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full text-sm mb-6">
              <Activity className="w-4 h-4" />
              <span>Saving Lives Through Technology</span>
            </div>

            <h1 className="text-gray-900 dark:text-white mb-6">
              The Future of Organ & Blood Network Management
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Connect medical centers nationwide with our AI-powered platform
              for organ procurement, blood bank management, and real-time
              patient matching.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl h-12 px-8">
                  Start Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="rounded-xl h-12 px-8 border-gray-300 dark:border-gray-700"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">
              Powerful Features for Medical Professionals
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Everything you need to manage organ procurement and blood bank
              operations efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">
              How LifeNet Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Simple, efficient, and designed for medical professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white">1</span>
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">
                Register Your Center
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick and secure onboarding process for medical facilities
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white">2</span>
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">
                Connect & Match
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time matching with patients and donors across the network
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white">3</span>
              </div>
              <h3 className="text-gray-900 dark:text-white mb-2">Save Lives</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Efficient coordination leads to faster transplants and better
                outcomes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="about"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-gray-900 dark:text-white mb-4">
              Trusted by Medical Professionals
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              See what healthcare providers are saying about LifeNet
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.name}
                className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="rounded-3xl border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-600 to-blue-700 overflow-hidden">
            <CardContent className="p-12">
              <h2 className="text-white mb-4">
                Ready to Transform Healthcare?
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Join the network of medical centers saving lives with LifeNet
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login">
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 rounded-xl h-12 px-8">
                    Get Started Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="rounded-xl h-12 px-8 border-white text-white hover:bg-white/10"
                >
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="text-gray-900 dark:text-white">LifeNet</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Revolutionizing organ and blood network management for medical
                professionals.
              </p>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white mb-4">Product</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Security
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white mb-4">Company</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  About
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Blog
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Careers
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white mb-4">Legal</h4>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  HIPAA
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 LifeNet. All rights reserved. Developed by Tusk
              (24BCS12988)
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
