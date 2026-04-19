import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Loader2, RefreshCw, Grid3x3, Clock, X, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../AuthContext";

const ORGAN_CATEGORIES = [
  { name: "Heart", viabilityHours: 6, description: "Cardiac transplants for end-stage heart failure. Time-critical with 4-6 hour viability window.", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950" },
  { name: "Liver", viabilityHours: 24, description: "Hepatic transplants for liver failure. Up to 24 hours viability allows wider recipient matching.", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950" },
  { name: "Kidney", viabilityHours: 36, description: "Renal transplants for chronic kidney disease. Longest viability enables national matching.", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950" },
  { name: "Lung", viabilityHours: 8, description: "Pulmonary transplants for end-stage lung disease. Requires precise size matching.", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950" },
  { name: "Pancreas", viabilityHours: 20, description: "Pancreatic transplants for Type 1 diabetes and pancreatic failure.", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950" },
  { name: "Cornea", viabilityHours: 336, description: "Corneal transplants for vision restoration. Up to 14 days viability with cold storage.", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950" },
  { name: "Bone Marrow", viabilityHours: 24, description: "Hematopoietic stem cell transplants for blood cancers and immune disorders.", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-950" },
  { name: "Skin", viabilityHours: 720, description: "Skin grafts for severe burns and wound coverage. Up to 30 days with proper preservation.", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950" },
];

export function Categories() {
  const { user } = useAuth();
  const [showInfo, setShowInfo] = useState(null);

  const formatViability = (hours) => {
    if (hours < 24) return `${hours} hours`;
    if (hours < 168) return `${Math.round(hours / 24)} days`;
    return `${Math.round(hours / 24)} days`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Organ Categories</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Reference guide for organ types, viability windows, and transplant protocols
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Organ Types", value: ORGAN_CATEGORIES.length, icon: Grid3x3, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Shortest Viability", value: "4–6 hrs", icon: Clock, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
          { label: "Longest Viability", value: "30 days", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Avg Viability", value: "~5 days", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {ORGAN_CATEGORIES.map((cat) => (
          <Card
            key={cat.name}
            className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
            onClick={() => setShowInfo(cat)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${cat.bg} rounded-xl flex items-center justify-center`}>
                  <span className={`text-xl font-bold ${cat.color}`}>{cat.name[0]}</span>
                </div>
                <Badge variant="outline" className="rounded-lg text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatViability(cat.viabilityHours)}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{cat.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{cat.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Viability window</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.color.replace("text-", "bg-")}`}
                        style={{ width: `${Math.min((cat.viabilityHours / 720) * 100, 100)}%` }}
                      />
                    </div>
                    <span className={`font-medium ${cat.color}`}>{formatViability(cat.viabilityHours)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!showInfo} onOpenChange={() => setShowInfo(null)}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white pb-2">
              {showInfo?.name} Organ Details
            </DialogTitle>
          </DialogHeader>
          {showInfo && (
            <div className="space-y-4 pt-2">
              <div className={`p-6 ${showInfo.bg} rounded-2xl text-center`}>
                <p className={`text-5xl font-bold ${showInfo.color}`}>{showInfo.name[0]}</p>
                <p className={`text-sm font-medium mt-2 ${showInfo.color}`}>{showInfo.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Viability Window</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatViability(showInfo.viabilityHours)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Hours</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{showInfo.viabilityHours}h</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{showInfo.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
