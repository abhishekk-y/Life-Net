import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
import { Textarea } from "../ui/textarea";
import {
  AlertCircle,
  Calendar,
  User,
  Building2,
  Activity,
  X,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

const initialRequests = [
  {
    request_id: "REQ-1024",
    request_type: "Organ",
    organ_type: "Kidney",
    blood_group: "A+",
    patient_name: "John Doe",
    patient_age: 45,
    hospital_id: "HOSP-001",
    hospital_name: "Central Hospital",
    priority: "High",
    status: "Pending",
    created_date: "2024-11-08",
    medical_urgency: "Urgent - ESRD Stage 5",
    doctor: "Dr. Sarah Williams",
    contact: "+1 (555) 123-4567",
    location: "New York, NY",
  },
  {
    request_id: "REQ-1023",
    request_type: "Blood",
    organ_type: "O+ Blood",
    blood_group: "O+",
    patient_name: "Jane Smith",
    patient_age: 32,
    hospital_id: "HOSP-002",
    hospital_name: "City Medical",
    priority: "Critical",
    status: "Matched",
    created_date: "2024-11-09",
    medical_urgency: "Emergency Surgery",
    quantity: 4,
    doctor: "Dr. Michael Chen",
    contact: "+1 (555) 234-5678",
    location: "Los Angeles, CA",
  },
  {
    request_id: "REQ-1022",
    request_type: "Organ",
    organ_type: "Liver",
    blood_group: "B+",
    patient_name: "Mike Johnson",
    patient_age: 52,
    hospital_id: "HOSP-003",
    hospital_name: "St. Mary's Hospital",
    priority: "Medium",
    status: "Processing",
    created_date: "2024-11-07",
    medical_urgency: "Cirrhosis - MELD Score 25",
    doctor: "Dr. Robert Brown",
    contact: "+1 (555) 345-6789",
    location: "Chicago, IL",
  },
  {
    request_id: "REQ-1021",
    request_type: "Blood",
    organ_type: "AB- Blood",
    blood_group: "AB-",
    patient_name: "Sarah Williams",
    patient_age: 28,
    hospital_id: "HOSP-004",
    hospital_name: "General Hospital",
    priority: "Low",
    status: "Completed",
    created_date: "2024-11-06",
    medical_urgency: "Routine Transfusion",
    quantity: 2,
    doctor: "Dr. Emily Davis",
    contact: "+1 (555) 456-7890",
    location: "Houston, TX",
  },
  {
    request_id: "REQ-1020",
    request_type: "Organ",
    organ_type: "Heart",
    blood_group: "O-",
    patient_name: "Robert Brown",
    patient_age: 58,
    hospital_id: "HOSP-005",
    hospital_name: "Memorial Hospital",
    priority: "Critical",
    status: "Pending",
    created_date: "2024-11-10",
    medical_urgency: "Heart Failure - NYHA Class IV",
    doctor: "Dr. Jennifer Martinez",
    contact: "+1 (555) 567-8901",
    location: "Miami, FL",
  },
];

export function Requests() {
  const [requests, setRequests] = useState(initialRequests);
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [requestToProcess, setRequestToProcess] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRequest = {
      request_id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      request_type: formData.get("request_type"),
      organ_type: formData.get("organ_type"),
      blood_group: formData.get("blood_group"),
      patient_name: formData.get("patient_name"),
      patient_age: parseInt(formData.get("patient_age")),
      hospital_id: formData.get("hospital_id"),
      hospital_name: "New Hospital",
      priority: formData.get("priority"),
      status: "Pending",
      created_date: new Date().toISOString().split("T")[0],
      medical_urgency: formData.get("medical_urgency"),
      quantity: formData.get("quantity")
        ? parseInt(formData.get("quantity"))
        : undefined,
      doctor: "Dr. Assigned",
      contact: "+1 (555) 000-0000",
      location: "Location TBD",
    };

    setRequests([newRequest, ...requests]);
    toast.success("Request submitted successfully");
    setOpen(false);
  };

  const handleProcess = () => {
    if (!requestToProcess) return;

    setRequests(
      requests.map((req) =>
        req.request_id === requestToProcess.request_id
          ? { ...req, status: "Processing" }
          : req,
      ),
    );

    toast.success(
      `Request ${requestToProcess.request_id} is now being processed`,
    );
    setProcessDialogOpen(false);
    setRequestToProcess(null);
  };

  const handleApprove = (requestId) => {
    setRequests(
      requests.map((req) =>
        req.request_id === requestId ? { ...req, status: "Matched" } : req,
      ),
    );
    toast.success("Request approved and matched successfully");
  };

  const handleReject = (requestId) => {
    setRequests(
      requests.map((req) =>
        req.request_id === requestId ? { ...req, status: "Rejected" } : req,
      ),
    );
    toast.error("Request has been rejected");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white">Requests</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage organ and blood requests
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            New Request
          </Button>
          <DialogContent className="sm:max-w-[500px] rounded-2xl bg-white dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">
                Create New Request
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="request_type"
                  className="text-gray-900 dark:text-white"
                >
                  Request Type
                </Label>
                <Select name="request_type" required>
                  <SelectTrigger className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organ">Organ</SelectItem>
                    <SelectItem value="blood">Blood</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="organ_type"
                  className="text-gray-900 dark:text-white"
                >
                  Organ/Blood Type
                </Label>
                <Input
                  id="organ_type"
                  name="organ_type"
                  placeholder="e.g., Kidney, A+ Blood"
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
                    Quantity (for blood)
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="Units"
                    className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="patient_name"
                  className="text-gray-900 dark:text-white"
                >
                  Patient Name
                </Label>
                <Input
                  id="patient_name"
                  name="patient_name"
                  placeholder="Full name"
                  className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="patient_age"
                    className="text-gray-900 dark:text-white"
                  >
                    Patient Age
                  </Label>
                  <Input
                    id="patient_age"
                    name="patient_age"
                    type="number"
                    placeholder="Age"
                    className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="priority"
                    className="text-gray-900 dark:text-white"
                  >
                    Priority
                  </Label>
                  <Select name="priority" required>
                    <SelectTrigger className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
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
                  htmlFor="medical_urgency"
                  className="text-gray-900 dark:text-white"
                >
                  Medical Urgency / Notes
                </Label>
                <Textarea
                  id="medical_urgency"
                  name="medical_urgency"
                  placeholder="Describe urgency and medical condition"
                  className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  rows={3}
                  required
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
                  Submit Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <Card
            key={request.request_id}
            className="rounded-2xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900"
          >
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <CardTitle className="text-gray-900 dark:text-white">
                      {request.request_id}
                    </CardTitle>
                    <Badge
                      className={`rounded-lg ${
                        request.priority === "Critical"
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                          : request.priority === "High"
                            ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400"
                            : request.priority === "Medium"
                              ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      } hover:bg-current`}
                    >
                      {request.priority === "Critical" && (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {request.priority}
                    </Badge>
                    <Badge
                      className={`rounded-lg ${
                        request.status === "Completed"
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                          : request.status === "Matched"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                            : request.status === "Processing"
                              ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                              : request.status === "Rejected"
                                ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      } hover:bg-current`}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400">
                    {request.organ_type}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl border-gray-300 dark:border-gray-700"
                    onClick={() => setSelectedRequest(request)}
                  >
                    View Details
                  </Button>
                  {request.status === "Pending" && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                      onClick={() => {
                        setRequestToProcess(request);
                        setProcessDialogOpen(true);
                      }}
                    >
                      Process
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Patient
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {request.patient_name}, {request.patient_age}y
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Blood Group
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {request.blood_group}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Hospital
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {request.hospital_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {request.created_date}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-xl">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  <span className="text-amber-700 dark:text-amber-400">
                    Medical Urgency:
                  </span>{" "}
                  {request.medical_urgency}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Detail Dialog */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-gray-900 dark:text-white">
              <span>Request {selectedRequest?.request_id}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRequest(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-4">
              <div className="flex gap-3 flex-wrap">
                <Badge
                  className={`${
                    selectedRequest.priority === "Critical"
                      ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                      : selectedRequest.priority === "High"
                        ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400"
                        : selectedRequest.priority === "Medium"
                          ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  } hover:bg-current`}
                >
                  {selectedRequest.priority} Priority
                </Badge>
                <Badge
                  className={`${
                    selectedRequest.status === "Completed"
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                      : selectedRequest.status === "Matched"
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                        : selectedRequest.status === "Processing"
                          ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  } hover:bg-current`}
                >
                  {selectedRequest.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Request Type
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedRequest.organ_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Blood Group
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedRequest.blood_group}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="text-sm text-gray-900 dark:text-white mb-3">
                  Patient Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Name:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.patient_name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Age:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.patient_age} years
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Blood Type:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.blood_group}
                    </span>
                  </div>
                  {selectedRequest.quantity && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Quantity Needed:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedRequest.quantity} units
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="text-sm text-gray-900 dark:text-white mb-3">
                  Hospital Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.hospital_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Hospital ID:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.hospital_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.contact}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Doctor:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedRequest.doctor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-xl">
                <h4 className="text-sm text-amber-900 dark:text-amber-200 mb-2">
                  Medical Urgency
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {selectedRequest.medical_urgency}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Created:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {selectedRequest.created_date}
                </span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                {selectedRequest.status === "Pending" && (
                  <>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                      onClick={() => {
                        handleApprove(selectedRequest.request_id);
                        setSelectedRequest(null);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => {
                        handleReject(selectedRequest.request_id);
                        setSelectedRequest(null);
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {selectedRequest.status !== "Pending" && (
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-gray-300 dark:border-gray-700"
                  >
                    Contact Hospital
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Request Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Process Request
            </DialogTitle>
          </DialogHeader>
          {requestToProcess && (
            <div className="space-y-4 pt-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to start processing request{" "}
                <strong>{requestToProcess.request_id}</strong>?
              </p>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-xl">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Patient:</strong> {requestToProcess.patient_name}
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Type:</strong> {requestToProcess.organ_type}
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Priority:</strong> {requestToProcess.priority}
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will change the request status to "Processing" and notify
                the relevant medical staff.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-300 dark:border-gray-700"
                  onClick={() => setProcessDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl"
                  onClick={handleProcess}
                >
                  Confirm Process
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
