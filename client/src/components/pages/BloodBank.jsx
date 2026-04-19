import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Droplets, TrendingUp, User, X, Building2, Phone } from "lucide-react";
import { toast } from "sonner";

const initialInventory = [
  {
    blood_group: "A+",
    units: 342,
    capacity: 400,
    status: "Good",
    donations_today: 12,
    expiring_soon: 8,
    location: "Central Blood Bank",
    last_tested: "2024-11-09",
  },
  {
    blood_group: "O+",
    units: 298,
    capacity: 400,
    status: "Good",
    donations_today: 15,
    expiring_soon: 5,
    location: "Central Blood Bank",
    last_tested: "2024-11-10",
  },
  {
    blood_group: "B+",
    units: 256,
    capacity: 400,
    status: "Medium",
    donations_today: 8,
    expiring_soon: 12,
    location: "City Medical Center",
    last_tested: "2024-11-09",
  },
  {
    blood_group: "AB+",
    units: 189,
    capacity: 400,
    status: "Medium",
    donations_today: 6,
    expiring_soon: 7,
    location: "Regional Hospital",
    last_tested: "2024-11-08",
  },
  {
    blood_group: "A-",
    units: 167,
    capacity: 200,
    status: "Low",
    donations_today: 4,
    expiring_soon: 9,
    location: "University Medical",
    last_tested: "2024-11-10",
  },
  {
    blood_group: "O-",
    units: 145,
    capacity: 200,
    status: "Critical",
    donations_today: 3,
    expiring_soon: 6,
    location: "Central Blood Bank",
    last_tested: "2024-11-09",
  },
  {
    blood_group: "B-",
    units: 123,
    capacity: 200,
    status: "Critical",
    donations_today: 2,
    expiring_soon: 4,
    location: "Memorial Hospital",
    last_tested: "2024-11-08",
  },
  {
    blood_group: "AB-",
    units: 98,
    capacity: 200,
    status: "Critical",
    donations_today: 1,
    expiring_soon: 3,
    location: "St. Mary's Hospital",
    last_tested: "2024-11-07",
  },
];

const initialDonations = [
  {
    donation_id: "DON-2024-156",
    donor_name: "Michael Chen",
    blood_group: "O+",
    quantity: 450,
    donation_date: "2024-11-10",
    hospital_id: "HOSP-001",
    hospital_name: "Central Hospital",
    status: "Processed",
    donor_contact: "+1 (555) 123-4567",
  },
  {
    donation_id: "DON-2024-155",
    donor_name: "Emily Rodriguez",
    blood_group: "A+",
    quantity: 500,
    donation_date: "2024-11-10",
    hospital_id: "HOSP-002",
    hospital_name: "City Medical",
    status: "Testing",
    donor_contact: "+1 (555) 234-5678",
  },
  {
    donation_id: "DON-2024-154",
    donor_name: "David Kim",
    blood_group: "B+",
    quantity: 450,
    donation_date: "2024-11-09",
    hospital_id: "HOSP-003",
    hospital_name: "St. Mary's",
    status: "Processed",
    donor_contact: "+1 (555) 345-6789",
  },
  {
    donation_id: "DON-2024-153",
    donor_name: "Sarah Johnson",
    blood_group: "AB+",
    quantity: 475,
    donation_date: "2024-11-09",
    hospital_id: "HOSP-001",
    hospital_name: "Central Hospital",
    status: "Processed",
    donor_contact: "+1 (555) 456-7890",
  },
  {
    donation_id: "DON-2024-152",
    donor_name: "James Wilson",
    blood_group: "O-",
    quantity: 450,
    donation_date: "2024-11-08",
    hospital_id: "HOSP-004",
    hospital_name: "General Hospital",
    status: "Processed",
    donor_contact: "+1 (555) 567-8901",
  },
];

export function BloodBank() {
  const [inventory, setInventory] = useState(initialInventory);
  const [donations, setDonations] = useState(initialDonations);
  const [open, setOpen] = useState(false);
  const [selectedBlood, setSelectedBlood] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newDonation = {
      donation_id: `DON-2024-${Math.floor(100 + Math.random() * 900)}`,
      donor_name: formData.get("donor_name"),
      blood_group: formData.get("blood_group"),
      quantity: parseInt(formData.get("quantity")),
      donation_date:
        formData.get("donation_date") || new Date().toISOString().split("T")[0],
      hospital_id: formData.get("hospital_id"),
      hospital_name: "New Hospital",
      status: "Testing",
      donor_contact: "+1 (555) 000-0000",
    };

    setDonations([newDonation, ...donations]);
    // Update inventory
    const bloodGroup = formData.get("blood_group");
    const quantity = parseInt(formData.get("quantity"));
    setInventory(
      inventory.map((item) =>
        item.blood_group === bloodGroup
          ? {
              ...item,
              units: item.units + Math.floor(quantity / 450),
              donations_today: item.donations_today + 1,
            }
          : item,
      ),
    );

    toast.success("Donation recorded successfully");
    setOpen(false);
  };

  const handleProcessDonation = (donationId) => {
    setDonations(
      donations.map((don) =>
        don.donation_id === donationId ? { ...don, status: "Processed" } : don,
      ),
    );
    toast.success("Donation processed successfully");
    setSelectedDonation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white">Blood Bank</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Inventory management and donations
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            Record Donation
          </Button>
          <DialogContent className="sm:max-w-[500px] rounded-2xl bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                Record Blood Donation
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="donor_name"
                  className="text-gray-900 dark:text-white"
                >
                  Donor Name
                </Label>
                <Input
                  id="donor_name"
                  name="donor_name"
                  placeholder="Full name"
                  className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="blood_group"
                    className="text-gray-900 dark:text-white"
                  >
                    Blood Group
                  </Label>
                  <Select name="blood_group" required>
                    <SelectTrigger className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="quantity"
                    className="text-gray-900 dark:text-white"
                  >
                    Quantity (ml)
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="450"
                    className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="hospital_id"
                  className="text-gray-900 dark:text-white"
                >
                  Hospital ID
                </Label>
                <Input
                  id="hospital_id"
                  name="hospital_id"
                  placeholder="HOSP-XXX"
                  className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="donation_date"
                  className="text-gray-900 dark:text-white"
                >
                  Donation Date
                </Label>
                <Input
                  id="donation_date"
                  name="donation_date"
                  type="date"
                  className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border-gray-300 dark:border-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Record Donation
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {inventory.map((item) => (
          <Card
            key={item.blood_group}
            className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedBlood(item)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-950 rounded-xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white">
                      Type {item.blood_group}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.units} units
                    </p>
                  </div>
                </div>
                <Badge
                  className={`rounded-lg ${
                    item.status === "Critical"
                      ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                      : item.status === "Low"
                        ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400"
                        : item.status === "Medium"
                          ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400"
                          : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                  } hover:bg-current`}
                >
                  {item.status}
                </Badge>
              </div>

              <Progress
                value={(item.units / item.capacity) * 100}
                className="h-2 mb-4"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Capacity
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {item.units}/{item.capacity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Today
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{item.donations_today}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Expiring
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {item.expiring_soon}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Donations */}
      <Card className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Recent Donations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    Donation ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    Donor Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    Blood Group
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    Quantity
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    Hospital
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr
                    key={donation.donation_id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                      {donation.donation_id}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                      {donation.donor_name}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 rounded-lg text-xs">
                        <Droplets className="w-3 h-3" />
                        {donation.blood_group}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                      {donation.quantity}ml
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {donation.donation_date}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {donation.hospital_id}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs ${
                          donation.status === "Processed"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 dark:text-blue-400"
                        onClick={() => setSelectedDonation(donation)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Blood Inventory Detail Dialog */}
      <Dialog
        open={!!selectedBlood}
        onOpenChange={() => setSelectedBlood(null)}
      >
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>Blood Type {selectedBlood?.blood_group} Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBlood(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedBlood && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-1">
                    Total Units
                  </p>
                  <p className="text-2xl text-red-700 dark:text-red-300">
                    {selectedBlood.units}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                    Capacity
                  </p>
                  <p className="text-2xl text-emerald-700 dark:text-emerald-300">
                    {selectedBlood.capacity}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="text-sm text-gray-900 dark:text-white mb-3">
                  Status Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status:
                    </span>
                    <Badge
                      className={`${
                        selectedBlood.status === "Critical"
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                          : selectedBlood.status === "Low"
                            ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400"
                            : selectedBlood.status === "Medium"
                              ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400"
                              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      } hover:bg-current`}
                    >
                      {selectedBlood.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Donations Today:
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{selectedBlood.donations_today}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Expiring Soon:
                    </span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {selectedBlood.expiring_soon} units
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Last Tested:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedBlood.last_tested}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Location:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedBlood.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Inventory Status
                </p>
                <Progress
                  value={(selectedBlood.units / selectedBlood.capacity) * 100}
                  className="h-3"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {Math.round(
                    (selectedBlood.units / selectedBlood.capacity) * 100,
                  )}
                  % capacity
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Request Blood
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-300 dark:border-gray-700"
                >
                  View History
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Donation Detail Dialog */}
      <Dialog
        open={!!selectedDonation}
        onOpenChange={() => setSelectedDonation(null)}
      >
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>Donation {selectedDonation?.donation_id}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDonation(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4 pt-4">
              <div className="flex gap-3">
                <Badge
                  className={`${
                    selectedDonation.status === "Processed"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                  } hover:bg-current`}
                >
                  {selectedDonation.status}
                </Badge>
                <Badge className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 hover:bg-red-100">
                  <Droplets className="w-3 h-3 mr-1" />
                  {selectedDonation.blood_group}
                </Badge>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="text-sm text-gray-900 dark:text-white mb-3">
                  Donor Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Name:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedDonation.donor_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Contact:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedDonation.donor_contact}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Droplets className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Blood Group:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedDonation.blood_group}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="text-sm text-gray-900 dark:text-white mb-3">
                  Donation Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Quantity:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedDonation.quantity}ml
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Donation Date:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedDonation.donation_date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Hospital:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedDonation.hospital_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Hospital ID:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedDonation.hospital_id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                {selectedDonation.status === "Testing" && (
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                    onClick={() =>
                      handleProcessDonation(selectedDonation.donation_id)
                    }
                  >
                    Mark as Processed
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-300 dark:border-gray-700"
                >
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
