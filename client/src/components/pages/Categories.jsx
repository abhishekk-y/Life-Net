import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Heart, Activity, Brain, Eye, Pill, Bone } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { X } from "lucide-react";

const categories = [
  {
    id: "cat_001",
    name: "Heart",
    icon: Heart,
    available: 23,
    waiting: 145,
    avgWaitTime: "6-12 months",
    description: "Cardiac transplants for end-stage heart disease",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    successRate: 96,
    urgentCases: 12,
    totalTransplants: 342,
    requirements: ["Blood type match", "Size compatibility", "Tissue typing"],
  },
  {
    id: "cat_002",
    name: "Kidney",
    icon: Activity,
    available: 87,
    waiting: 423,
    avgWaitTime: "3-5 years",
    description: "Renal transplants for kidney failure patients",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    successRate: 98,
    urgentCases: 45,
    totalTransplants: 892,
    requirements: ["Blood type match", "HLA matching", "Cross-match test"],
  },
  {
    id: "cat_003",
    name: "Liver",
    icon: Pill,
    available: 45,
    waiting: 234,
    avgWaitTime: "1-2 years",
    description: "Hepatic transplants for liver disease",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    successRate: 94,
    urgentCases: 28,
    totalTransplants: 567,
    requirements: ["Blood type compatibility", "Size match", "MELD score"],
  },
  {
    id: "cat_004",
    name: "Lung",
    icon: Activity,
    available: 34,
    waiting: 167,
    avgWaitTime: "4-8 months",
    description: "Pulmonary transplants for respiratory failure",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    successRate: 92,
    urgentCases: 18,
    totalTransplants: 234,
    requirements: ["Blood type match", "Chest size", "LAS score"],
  },
  {
    id: "cat_005",
    name: "Pancreas",
    icon: Bone,
    available: 28,
    waiting: 98,
    avgWaitTime: "1-2 years",
    description: "Pancreatic transplants for diabetes patients",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    successRate: 91,
    urgentCases: 8,
    totalTransplants: 178,
    requirements: ["Blood type match", "HLA typing", "Diabetes duration"],
  },
  {
    id: "cat_006",
    name: "Cornea",
    icon: Eye,
    available: 156,
    waiting: 76,
    avgWaitTime: "2-4 weeks",
    description: "Corneal transplants for vision restoration",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    successRate: 99,
    urgentCases: 5,
    totalTransplants: 1243,
    requirements: ["Eye health assessment", "Tissue compatibility"],
  },
  {
    id: "cat_007",
    name: "Bone Marrow",
    icon: Brain,
    available: 67,
    waiting: 189,
    avgWaitTime: "3-6 months",
    description: "Stem cell transplants for blood disorders",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    successRate: 89,
    urgentCases: 23,
    totalTransplants: 456,
    requirements: ["HLA matching", "Blood type", "Health screening"],
  },
  {
    id: "cat_008",
    name: "Skin",
    icon: Activity,
    available: 234,
    waiting: 45,
    avgWaitTime: "1-2 weeks",
    description: "Skin grafts for burn victims",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    successRate: 97,
    urgentCases: 3,
    totalTransplants: 678,
    requirements: ["Blood type", "Tissue typing", "Burn assessment"],
  },
];

export function Categories() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white">Organ Categories</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Browse available organ transplant categories
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
              className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-900"
            >
              <CardContent className="p-6">
                <div
                  className={`w-14 h-14 ${category.bgColor} dark:${category.bgColor.replace("50", "950")} rounded-2xl flex items-center justify-center mb-4`}
                >
                  <Icon
                    className={`w-7 h-7 ${category.color} dark:${category.color.replace("600", "400")}`}
                  />
                </div>

                <h3 className="text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Available
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {category.available}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Waiting
                    </span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {category.waiting}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Avg. Wait
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {category.avgWaitTime}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-xl border-gray-300 dark:border-gray-700"
                  onClick={() => setSelectedCategory(category)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Detail Dialog */}
      <Dialog
        open={!!selectedCategory}
        onOpenChange={() => setSelectedCategory(null)}
      >
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <div className="flex items-center gap-3">
                {selectedCategory &&
                  (() => {
                    const Icon = selectedCategory.icon;
                    return (
                      <div
                        className={`w-12 h-12 ${selectedCategory.bgColor} dark:${selectedCategory.bgColor.replace("50", "950")} rounded-xl flex items-center justify-center`}
                      >
                        <Icon
                          className={`w-6 h-6 ${selectedCategory.color} dark:${selectedCategory.color.replace("600", "400")}`}
                        />
                      </div>
                    );
                  })()}
                <span>{selectedCategory?.name} Transplant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6 pt-4">
              <p className="text-gray-600 dark:text-gray-400">
                {selectedCategory.description}
              </p>

              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl text-center">
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                    Available
                  </p>
                  <p className="text-2xl text-blue-700 dark:text-blue-300">
                    {selectedCategory.available}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-xl text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                    Waiting
                  </p>
                  <p className="text-2xl text-amber-700 dark:text-amber-300">
                    {selectedCategory.waiting}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-xl text-center">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                    Urgent
                  </p>
                  <p className="text-2xl text-red-700 dark:text-red-300">
                    {selectedCategory.urgentCases}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl text-center">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                    Total
                  </p>
                  <p className="text-2xl text-emerald-700 dark:text-emerald-300">
                    {selectedCategory.totalTransplants}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Average Wait Time
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {selectedCategory.avgWaitTime}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Success Rate
                  </span>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={selectedCategory.successRate}
                      className="w-24 h-2"
                    />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">
                      {selectedCategory.successRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="text-sm text-gray-900 dark:text-white mb-3">
                  Requirements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.requirements.map((req, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950"
                    >
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">
                  View Available Organs
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-300 dark:border-gray-700"
                >
                  Create Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
