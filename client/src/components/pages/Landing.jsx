import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NetworkMap } from "../ui/NetworkMap";
import {
  Heart, Users, Activity, TrendingUp, ArrowRight, Droplets, Building2,
  Clock, Shield, Moon, Sun, CheckCircle2, Zap, Globe, Bell, ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { useTheme } from "../ThemeProvider";

const stats = [
  { value: "8+",    label: "Network Centers",   icon: Building2,   color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950" },
  { value: "30+",   label: "Organs Available",  icon: Heart,       color: "text-rose-600 dark:text-rose-400",   bg: "bg-rose-50 dark:bg-rose-950" },
  { value: "40+",   label: "Blood Units",       icon: Droplets,    color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-950" },
  { value: "99.8%", label: "Uptime SLA",        icon: TrendingUp,  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950" },
];

const features = [
  {
    icon: Zap,
    title: "Real-Time Emergency Alerts",
    description: "Socket.io powered instant notifications when critical organs become available. Sub-second latency across the entire network.",
    badge: "Live",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  {
    icon: Heart,
    title: "Smart Organ Matching",
    description: "Blood group, HLA compatibility, viability window, and geographic proximity — all factored into every match automatically.",
    badge: "AI-Powered",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950",
  },
  {
    icon: Droplets,
    title: "Blood Bank Management",
    description: "Track 40+ units across 8 blood groups and 5 components. Expiry alerts before critical shortages occur.",
    badge: "Analytics",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    icon: Shield,
    title: "JWT Role-Based Security",
    description: "Hospitals, blood banks, procurement centers and admins each get scoped access. HIPAA-grade data protection built in.",
    badge: "Secure",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
  {
    icon: Activity,
    title: "Full Workflow Tracking",
    description: "Every request moves through Pending → Matched → Approved → In Transit → Completed with one-click actions.",
    badge: "Workflow",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
  {
    icon: Globe,
    title: "Multi-Center Network",
    description: "NOTTO, ZOTTO, AIIMS, Apollo, Fortis and 50+ centres — all on one unified platform with real-time inventory sync.",
    badge: "National",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950",
  },
];

const steps = [
  { num: "01", title: "Register Your Center", desc: "Hospitals, blood banks and procurement centers onboard in minutes with role-based access configured automatically." },
  { num: "02", title: "List & Monitor Resources", desc: "Add organs with viability timers, blood units with expiry tracking — the system alerts your team before time runs out." },
  { num: "03", title: "Receive & Act on Requests", desc: "EMERGENCY, URGENT and ROUTINE requests land in real-time. Approve, transfer, complete — all from one screen." },
  { num: "04", title: "Track to Completion", desc: "Full audit trail from procurement to transplant. Every action logged for compliance and accountability." },
];

const urgencyItems = [
  { type: "HEART", blood: "O+", city: "Delhi", time: "3h left", urgent: true },
  { type: "KIDNEY", blood: "A+", city: "Chennai", time: "18h left", urgent: false },
  { type: "O- Blood", blood: "O-", city: "Mumbai", time: "Emergency", urgent: true },
  { type: "LIVER", blood: "B+", city: "Bangalore", time: "8h left", urgent: false },
];

export function Landing() {
  const { theme, toggleTheme } = useTheme();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">LifeNet</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "How it Works"].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                  {l}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={toggleTheme}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                {theme === "dark"
                  ? <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  : <Moon className="w-4 h-4 text-gray-600" />}
              </button>
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl h-9 px-5 text-sm shadow-lg shadow-blue-600/25">
                  Sign In <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-rose-400/10 dark:bg-rose-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 rounded-full text-sm mb-8 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live Network — 8 Centers Online
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              India's Organ &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500">
                Blood Network
              </span>
              <br />Management Platform
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connecting AIIMS, Apollo, Fortis, NOTTO, Red Cross and 50+ centers for real-time organ procurement,
              blood inventory, and emergency request coordination.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 px-10 text-base shadow-xl shadow-blue-600/30 font-semibold">
                  Access Platform <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" className="rounded-2xl h-14 px-10 text-base border-gray-200 dark:border-gray-700 font-semibold">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Live Feed Card */}
            <div className="max-w-lg mx-auto">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Network Feed</span>
                  <Badge className="ml-auto bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full text-xs">Live</Badge>
                </div>
                
                {/* Embedded Mini Network Map */}
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                  <NetworkMap />
                </div>

                <div className="space-y-2">
                  {urgencyItems.map((item, i) => (
                    <div key={i}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-sm transition-all duration-500 ${i === tick % 4 ? "bg-blue-50 dark:bg-blue-950/50 ring-1 ring-blue-200 dark:ring-blue-800" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                      <div className="flex items-center gap-2">
                        {item.type.includes("Blood")
                          ? <Droplets className="w-3.5 h-3.5 text-red-500" />
                          : <Heart className="w-3.5 h-3.5 text-rose-500" />}
                        <span className="font-medium text-gray-900 dark:text-white">{item.type}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">{item.blood}</Badge>
                        <span className="text-gray-500 dark:text-gray-400">{item.city}</span>
                      </div>
                      <Badge className={`text-[10px] rounded-full ${item.urgent ? "bg-red-600 text-white" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"}`}>
                        {item.time}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
            {stats.map(s => (
              <Card key={s.label} className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{s.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-full">Platform Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built for Medical Professionals
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Every feature designed for the high-stakes environment of organ procurement and blood management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <Card key={f.title}
                className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                    <Badge className="rounded-full text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{f.badge}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 rounded-full">Workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">How LifeNet Works</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">From organ procurement to transplant — every step coordinated in real time</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-blue-200 dark:from-blue-800 to-transparent z-10" />
                )}
                <Card className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-600/25">
                      <span className="text-white font-bold text-sm">{step.num}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 p-12 text-center shadow-2xl shadow-blue-600/30">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
            </div>
            <div className="relative">
              <Badge className="mb-6 bg-white/20 text-white border-white/20 rounded-full">Get Started Today</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Every Minute Counts
              </h2>
              <p className="text-blue-100 mb-8 text-lg max-w-xl mx-auto">
                A heart has 4–6 hours. A kidney has 36. LifeNet ensures
                that every viable organ finds its recipient — in time.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-2xl h-14 px-10 text-base font-bold shadow-xl">
                    Access Platform Now <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8">
                {["JWT Secured", "HIPAA Compliant", "24/7 Uptime"].map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-blue-100 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">LifeNet</span>
              <span className="text-gray-400 dark:text-gray-600 mx-2">—</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Smart Organ & Blood Management System</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} LifeNet. Built for India's healthcare network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
