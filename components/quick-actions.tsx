"use client"

import { useState } from "react"
import { CalendarPlus, Clock, UserPlus, Pill, FileText, Bell, QrCode, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export function QuickActions() {
  const { toast } = useToast()
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const handleSubmit = (action: string) => {
    toast({
      title: "Action completed",
      description: `Successfully completed: ${action}`,
    })
    setOpenDialog(null)
  }

  const actions = [
    {
      id: "new-appointment",
      icon: CalendarPlus,
      label: "New Appointment",
      description: "Schedule a new appointment",
    },
    {
      id: "add-patient",
      icon: UserPlus,
      label: "Add Patient",
      description: "Register a new patient",
    },
    {
      id: "manage-queue",
      icon: Clock,
      label: "Manage Queue",
      description: "View and adjust the queue",
    },
    {
      id: "check-in",
      icon: QrCode,
      label: "Check-in Patient",
      description: "Check-in a patient on arrival",
    },
    {
      id: "staff-rota",
      icon: CalendarClock,
      label: "Staff Rota",
      description: "Manage staff availability",
    },
    {
      id: "send-notification",
      icon: Bell,
      label: "Send Notification",
      description: "Message patients or staff",
    },
    {
      id: "prescription",
      icon: Pill,
      label: "Prescription",
      description: "Process a prescription",
    },
    {
      id: "pharmacy-services",
      icon: FileText,
      label: "Pharmacy Services",
      description: "Book health services",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Dialog
          key={action.id}
          open={openDialog === action.id}
          onOpenChange={(open) => setOpenDialog(open ? action.id : null)}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="h-24 flex-col justify-center gap-2 p-3">
              <action.icon className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{action.label}</DialogTitle>
              <DialogDescription>{action.description}. Fill in the details below.</DialogDescription>
            </DialogHeader>

            {action.id === "new-appointment" && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="patient">Patient</Label>
                  <div className="flex gap-2">
                    <Select className="flex-1">
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="john-smith">John Smith (NHS: 1234567890)</SelectItem>
                        <SelectItem value="emma-wilson">Emma Wilson (NHS: 2345678901)</SelectItem>
                        <SelectItem value="michael-brown">Michael Brown (NHS: 3456789012)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <UserPlus className="h-4 w-4" />
                      <span className="sr-only">Add new patient</span>
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="service">Service Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication-review">Medication Review</SelectItem>
                      <SelectItem value="flu-vaccination">Flu Vaccination</SelectItem>
                      <SelectItem value="blood-pressure">Blood Pressure Check</SelectItem>
                      <SelectItem value="diabetes-review">Diabetes Review</SelectItem>
                      <SelectItem value="new-medicine">New Medicine Service</SelectItem>
                      <SelectItem value="smoking-cessation">Smoking Cessation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pharmacist">Pharmacist</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pharmacist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="james-williams">James Williams</SelectItem>
                      <SelectItem value="emily-chen">Emily Chen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input type="date" id="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label html />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input type="time" id="time" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Accessibility Needs</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="wheelchair" />
                      <Label htmlFor="wheelchair">Wheelchair access</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hearing" />
                      <Label htmlFor="hearing">Hearing impaired</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="visual" />
                      <Label htmlFor="visual">Visual impairment</Label>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" placeholder="Any special requirements or notes" />
                </div>
                <div className="grid gap-2">
                  <Label>Send Confirmation</Label>
                  <RadioGroup defaultValue="both">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="sms-confirm" />
                      <Label htmlFor="sms-confirm">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email-confirm" />
                      <Label htmlFor="email-confirm">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both-confirm" />
                      <Label htmlFor="both-confirm">Both</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {action.id === "add-patient" && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter patient name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nhs">NHS Number</Label>
                  <Input id="nhs" placeholder="Enter NHS number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input type="date" id="dob" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="Enter email address" type="email" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Enter address" />
                </div>
                <div className="grid gap-2">
                  <Label>Communication Preferences</Label>
                  <RadioGroup defaultValue="sms">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="sms" />
                      <Label htmlFor="sms">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email-pref" />
                      <Label htmlFor="email-pref">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both">Both</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {action.id === "check-in" && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="check-in-method">Check-in Method</Label>
                  <Select defaultValue="counter">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counter">Counter Check-in</SelectItem>
                      <SelectItem value="kiosk">Kiosk Check-in</SelectItem>
                      <SelectItem value="qr">QR Code Scan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="appointment-ref">Appointment Reference or NHS Number</Label>
                  <Input id="appointment-ref" placeholder="Enter reference or scan" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patient-name">Patient Name</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john-smith">John Smith - 09:00 (Medication Review)</SelectItem>
                      <SelectItem value="emma-wilson">Emma Wilson - 09:15 (Flu Vaccination)</SelectItem>
                      <SelectItem value="michael-brown">Michael Brown - 09:30 (New Medicine Service)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Pre-visit Information</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="completed-form" />
                    <Label htmlFor="completed-form">Patient completed pre-visit form</Label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="additional-notes">Additional Notes</Label>
                  <Textarea id="additional-notes" placeholder="Any additional information" />
                </div>
              </div>
            )}

            {action.id === "staff-rota" && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="staff-member">Staff Member</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah-johnson">Sarah Johnson (Pharmacist)</SelectItem>
                      <SelectItem value="james-williams">James Williams (Pharmacy Manager)</SelectItem>
                      <SelectItem value="emily-chen">Emily Chen (Pharmacist)</SelectItem>
                      <SelectItem value="michael-roberts">Michael Roberts (Pharmacy Technician)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date-from">Date From</Label>
                    <Input type="date" id="date-from" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date-to">Date To</Label>
                    <Input type="date" id="date-to" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="time-from">Time From</Label>
                    <Input type="time" id="time-from" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time-to">Time To</Label>
                    <Input type="time" id="time-to" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Available Services</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="medication-review" />
                      <Label htmlFor="medication-review">Medication Review</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="flu-vaccination" />
                      <Label htmlFor="flu-vaccination">Flu Vaccination</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="new-medicine" />
                      <Label htmlFor="new-medicine">New Medicine Service</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="blood-pressure" />
                      <Label htmlFor="blood-pressure">Blood Pressure Check</Label>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="available">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="leave">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="off">Day Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {action.id === "send-notification" && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipient-type">Recipient Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Patient</SelectItem>
                      <SelectItem value="all-today">All Patients Today</SelectItem>
                      <SelectItem value="waiting">Patients in Queue</SelectItem>
                      <SelectItem value="staff">Staff Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notification-type">Notification Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment-reminder">Appointment Reminder</SelectItem>
                      <SelectItem value="delay">Delay Notification</SelectItem>
                      <SelectItem value="prescription-ready">Prescription Ready</SelectItem>
                      <SelectItem value="queue-update">Queue Update</SelectItem>
                      <SelectItem value="custom">Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="both">Both SMS & Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Enter message" rows={4} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="send-now" defaultChecked />
                  <Label htmlFor="send-now">Send immediately</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit(action.label)}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
