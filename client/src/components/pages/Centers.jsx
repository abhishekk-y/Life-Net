import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { MapPin, Phone } from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search } from "lucide-react";

const centers = [
  {
    hospital_id: "HOSP-001",
    name: "City General Hospital",
    status: "Active Organs",
    success_rate: 98,
    response_time: "8 Min",
    location: "Downtown Medical District",
    last_action: "2 minutes ago",
    specialties: ["Heart", "Kidney", "Liver"],
    contact: "+1 (800-CTY-GEN)",
  },
  {
    hospital_id: "HOSP-002",
    name: "Memorial Medical Center",
    status: "Active Organs",
    success_rate: 96,
    response_time: "12 Min",
    location: "Westside Healthcare Complex",
    last_action: "5 minutes ago",
    specialties: ["Lungs", "Heart", "Cornea"],
    contact: "+1 (800-MEM-MED)",
  },
  {
    hospital_id: "HOSP-003",
    name: "St. Mary's Hospital",
    status: "Active Organs",
    success_rate: 97,
    response_time: "15 Min",
    location: "North Medical Campus",
    last_action: "10 minutes ago",
    specialties: ["Kidney", "Liver", "Pancreas"],
    contact: "+1 (800-ST-MARY)",
  },
  {
    hospital_id: "HOSP-004",
    name: "Regional Medical Center",
    status: "Active Organs",
    success_rate: 95,
    response_time: "18 Min",
    location: "East Healthcare District",
    last_action: "15 minutes ago",
    specialties: ["Heart", "Lungs", "Liver"],
    contact: "+1 (800-RMC-MED)",
  },
  {
    hospital_id: "HOSP-005",
    name: "University Hospital",
    status: "Active Organs",
    success_rate: 99,
    response_time: "10 Min",
    location: "South Medical Research Park",
    last_action: "1 minute ago",
    specialties: ["Kidney", "Liver"],
    contact: "+1 (800-UNI-HOSP)",
  },
  {
    hospital_id: "HOSP-006",
    name: "Central Care Hospital",
    status: "Active Organs",
    success_rate: 94,
    response_time: "20 Min",
    location: "Central Business District",
    last_action: "8 minutes ago",
    specialties: ["Heart", "Kidney", "Pancreas"],
    contact: "+1 (800-CEN-CARE)",
  },
];

export function Centers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Centers Enrolled</h1>
        <p className="text-gray-500">
          Detailed overview of all participating medical centers in our network
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by hospital name or specialty..."
            className="pl-10 rounded-xl border-gray-300 bg-white"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48 rounded-xl border-gray-300 bg-white">
            <SelectValue placeholder="All Centers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Centers</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="high-rate">High Success Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centers.map((center, index) => (
          <Card
            key={center.hospital_id}
            className="rounded-2xl border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-gray-900">{center.name}</h3>
                    <p className="text-xs text-gray-500">{center.status}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate:</span>
                  <span className="text-sm text-gray-900">
                    {center.success_rate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time:</span>
                  <span className="text-sm text-gray-900">
                    {center.response_time}
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Location:</p>
                    <p className="text-sm text-gray-700">{center.location}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Last Action:</p>
                  <p className="text-sm text-gray-700">{center.last_action}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {center.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-md px-2 py-1 text-xs"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>Contact {center.contact}</span>
                </div>
              </div>

              <Button
                variant="link"
                className="w-full mt-4 text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                Active Member
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
