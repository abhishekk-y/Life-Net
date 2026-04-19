import { Card, CardContent } from "../ui/card";
import { Droplets, Activity, TestTube, Target, Search } from "lucide-react";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const kpiData = [
  {
    title: "Total Units",
    value: "210",
    icon: Droplets,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Active Requests",
    value: "15",
    icon: Activity,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Tests Today",
    value: "45",
    icon: TestTube,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Cross Matches",
    value: "28",
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

const bloodInventory = [
  {
    blood_type: "A+",
    total_units: 45,
    plasma: { units: 20, max: 50 },
    platelets: { units: 15, max: 30 },
  },
  {
    blood_type: "A-",
    total_units: 25,
    plasma: { units: 10, max: 50 },
    platelets: { units: 8, max: 30 },
  },
  {
    blood_type: "B+",
    total_units: 35,
    plasma: { units: 15, max: 50 },
    platelets: { units: 12, max: 30 },
  },
  {
    blood_type: "B-",
    total_units: 15,
    plasma: { units: 8, max: 50 },
    platelets: { units: 5, max: 30 },
  },
  {
    blood_type: "O+",
    total_units: 55,
    plasma: { units: 25, max: 50 },
    platelets: { units: 20, max: 30 },
  },
  {
    blood_type: "O-",
    total_units: 20,
    plasma: { units: 10, max: 50 },
    platelets: { units: 10, max: 30 },
  },
  {
    blood_type: "AB+",
    total_units: 10,
    plasma: { units: 5, max: 50 },
    platelets: { units: 5, max: 30 },
  },
  {
    blood_type: "AB-",
    total_units: 5,
    plasma: { units: 3, max: 50 },
    platelets: { units: 2, max: 30 },
  },
];

export function BloodManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Droplets className="w-6 h-6 text-blue-600" />
        <h1 className="text-gray-900">Blood Bank Management</h1>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by hospital, request ID, or blood type..."
          className="pl-10 rounded-xl border-gray-300 bg-white"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.title}
              className="rounded-2xl border-gray-200 bg-white shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                    <h2 className="text-gray-900">{kpi.value}</h2>
                  </div>
                  <div
                    className={`w-12 h-12 ${kpi.bgColor} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
          + New Donation
        </Button>
        <Button
          variant="outline"
          className="rounded-xl border-gray-300 bg-white"
        >
          View Requests
        </Button>
      </div>

      {/* Blood Inventory Status */}
      <div>
        <h2 className="text-gray-900 mb-4">Blood Inventory Status</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-6">
            {bloodInventory.slice(0, 4).map((blood) => (
              <div key={blood.blood_type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      Type {blood.blood_type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {blood.total_units} Units
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Plasma</span>
                    <span>{blood.plasma.units} units</span>
                  </div>
                  <Progress
                    value={(blood.plasma.units / blood.plasma.max) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Platelets</span>
                    <span>{blood.platelets.units} units</span>
                  </div>
                  <Progress
                    value={(blood.platelets.units / blood.platelets.max) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {bloodInventory.slice(4, 8).map((blood) => (
              <div key={blood.blood_type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      Type {blood.blood_type}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {blood.total_units} Units
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Plasma</span>
                    <span>{blood.plasma.units} units</span>
                  </div>
                  <Progress
                    value={(blood.plasma.units / blood.plasma.max) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Platelets</span>
                    <span>{blood.platelets.units} units</span>
                  </div>
                  <Progress
                    value={(blood.platelets.units / blood.platelets.max) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
