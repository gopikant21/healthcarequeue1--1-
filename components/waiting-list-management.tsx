"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Clock, MoreHorizontal, Search, UserPlus, Bell, CalendarPlus, MessageSquare } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

interface WaitingListPatient {
  id: string
  name: string
  contactNumber: string
  email?: string
  nhsNumber: string
  preferredPharmacist: string
  reason: string
  urgency: "low" | "medium" | "high"
  addedTime: string
  addedDate: string
  notes?: string
  preferredTimes?: string[]
  notificationPreference: "sms" | "email" | "both"
  accessibility?: string[]
}

export function WaitingListManagement() {
  const { toast } = useToast()
  const [addPatientOpen, setAddPatientOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)

  const [waitingList, setWaitingList] = useState<WaitingListPatient[]>([
    {
      id: "w1",
      name: "Thomas Brown",
      contactNumber: "07700 900123",
      email: "thomas.brown@example.com",
      nhsNumber: "9876543210",
      preferredPharmacist: "Sarah Johnson",
      reason: "Persistent cough",
      urgency: "medium",
      addedTime: "08:30",
      addedDate: "Today",
      notes: "Patient prefers afternoon appointments",
      preferredTimes: ["Afternoon", "Evening"],
      notificationPreference: "sms",
    },
    {
      id: "w2",
      name: "Rebecca Clark",
      contactNumber: "07700 900456",
      email: "rebecca.clark@example.com",
      nhsNumber: "8765432109",
      preferredPharmacist: "James Williams",
      reason: "Medication review",
      urgency: "high",
      addedTime: "09:15",
      addedDate: "Today",
      notes: "Patient is on multiple medications",
      preferredTimes: ["Morning"],
      notificationPreference: "both",
      accessibility: ["Wheelchair access"],
    },
    {
      id: "w3",
      name: "George Wilson",
      contactNumber: "07700 900789",
      nhsNumber: "7654321098",
      preferredPharmacist: "Any",
      reason: "Prescription renewal",
      urgency: "low",
      addedTime: "10:45",
      addedDate: "Today",
      preferredTimes: ["Morning", "Afternoon"],
      notificationPreference: "sms",
    },
    {
      id: "w4",
      name: "Olivia Martinez",
      contactNumber: "07700 900234",
      email: "olivia.martinez@example.com",
      nhsNumber: "6543210987",
      preferredPharmacist: "Emily Chen",
      reason: "Medication review",
      urgency: "medium",
      addedTime: "14:20",
      addedDate: "Yesterday",
      preferredTimes: ["Afternoon"],
      notificationPreference: "email",
    },
    {
      id: "w5",
      name: "William Johnson",
      contactNumber: "07700 900567",
      nhsNumber: "5432109876",
      preferredPharmacist: "Michael Roberts",
      reason: "Follow-up appointment",
      urgency: "low",
      addedTime: "16:05",
      addedDate: "Yesterday",
      preferredTimes: ["Morning"],
      notificationPreference: "sms",
    },
  ])

  const addToWaitingList = (
    name: string,
    contactNumber: string,
    email: string,
    nhsNumber: string,
    preferredPharmacist: string,
    reason: string,
    urgency: WaitingListPatient["urgency"],
    preferredTimes: string[],
    notificationPreference: WaitingListPatient["notificationPreference"],
    accessibility: string[],
    notes?: string,
  ) => {
    const newPatient: WaitingListPatient = {
      id: `w${Date.now()}`,
      name,
      contactNumber,
      email: email || undefined,
      nhsNumber,
      preferredPharmacist,
      reason,
      urgency,
      addedTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      addedDate: "Today",
      notes,
      preferredTimes,
      notificationPreference,
      accessibility: accessibility.length > 0 ? accessibility : undefined,
    }

    setWaitingList([newPatient, ...waitingList])

    toast({
      title: "Patient added to waiting list",
      description: `${name} has been added to the waiting list`,
    })

    setAddPatientOpen(false)
  }

  const removeFromWaitingList = (id: string) => {
    setWaitingList(waitingList.filter((patient) => patient.id !== id))

    toast({
      title: "Patient removed from waiting list",
      description: "Patient has been removed from the waiting list",
    })
  }

  const scheduleAppointment = (id: string) => {
    setSelectedPatient(id)
    setScheduleDialogOpen(true)
  }

  const confirmScheduleAppointment = () => {
    // In a real app, this would create an appointment and remove from waiting list
    if (selectedPatient) {
      removeFromWaitingList(selectedPatient)

      toast({
        title: "Appointment scheduled",
        description: "Patient has been scheduled for an appointment and notified",
      })

      setScheduleDialogOpen(false)
      setSelectedPatient(null)
    }
  }

  const sendNotification = (id: string) => {
    const patient = waitingList.find((p) => p.id === id)
    if (!patient) return

    toast({
      title: "Notification sent",
      description: `${patient.notificationPreference === "both" ? "SMS and email" : patient.notificationPreference.toUpperCase()} notification sent to ${patient.name}`,
    })
  }

  const getUrgencyBadge = (urgency: WaitingListPatient["urgency"]) => {
    switch (urgency) {
      case "low":
        return <Badge variant="outline">Low</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "high":
        return <Badge variant="destructive">High</Badge>
    }
  }

  const filteredWaitingList = waitingList.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.nhsNumber.includes(searchQuery)

    const matchesUrgency = urgencyFilter === "all" || patient.urgency === urgencyFilter

    return matchesSearch && matchesUrgency
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients, NHS numbers or reasons..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgencies</SelectItem>
              <SelectItem value="high">High Urgency</SelectItem>
              <SelectItem value="medium">Medium Urgency</SelectItem>
              <SelectItem value="low">Low Urgency</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={addPatientOpen} onOpenChange={setAddPatientOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add to Waiting List
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Patient to Waiting List</DialogTitle>
                <DialogDescription>
                  Add a patient to the waiting list for the next available appointment
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Patient Name</Label>
                    <Input id="name" placeholder="Enter patient name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nhs">NHS Number</Label>
                    <Input id="nhs" placeholder="Enter NHS number" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input id="contact" placeholder="Enter contact number" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input id="email" placeholder="Enter email address" type="email" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pharmacist">Preferred Pharmacist</Label>
                  <Select defaultValue="any">
                    <SelectTrigger id="pharmacist">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Available Pharmacist</SelectItem>
                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="James Williams">James Williams</SelectItem>
                      <SelectItem value="Emily Chen">Emily Chen</SelectItem>
                      <SelectItem value="Michael Roberts">Michael Roberts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input id="reason" placeholder="Reason for appointment" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="urgency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Preferred Times</Label>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="morning" />
                      <Label htmlFor="morning">Morning</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="afternoon" />
                      <Label htmlFor="afternoon">Afternoon</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="evening" />
                      <Label htmlFor="evening">Evening</Label>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Accessibility Needs</Label>
                  <div className="flex flex-wrap gap-2">
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
                  <Label>Notification Preference</Label>
                  <RadioGroup defaultValue="sms">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="sms-pref" />
                      <Label htmlFor="sms-pref">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email-pref" />
                      <Label htmlFor="email-pref">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both-pref" />
                      <Label htmlFor="both-pref">Both</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" placeholder="Any additional notes" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddPatientOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const nameInput = document.getElementById("name") as HTMLInputElement
                    const contactInput = document.getElementById("contact") as HTMLInputElement
                    const emailInput = document.getElementById("email") as HTMLInputElement
                    const nhsInput = document.getElementById("nhs") as HTMLInputElement
                    const pharmacistSelect = document.getElementById("pharmacist") as HTMLSelectElement
                    const reasonInput = document.getElementById("reason") as HTMLInputElement
                    const urgencySelect = document.getElementById("urgency") as HTMLSelectElement
                    const notesInput = document.getElementById("notes") as HTMLTextAreaElement

                    // Get preferred times
                    const preferredTimes: string[] = []
                    if ((document.getElementById("morning") as HTMLInputElement)?.checked)
                      preferredTimes.push("Morning")
                    if ((document.getElementById("afternoon") as HTMLInputElement)?.checked)
                      preferredTimes.push("Afternoon")
                    if ((document.getElementById("evening") as HTMLInputElement)?.checked)
                      preferredTimes.push("Evening")

                    // Get accessibility needs
                    const accessibility: string[] = []
                    if ((document.getElementById("wheelchair") as HTMLInputElement)?.checked)
                      accessibility.push("Wheelchair access")
                    if ((document.getElementById("hearing") as HTMLInputElement)?.checked)
                      accessibility.push("Hearing impaired")
                    if ((document.getElementById("visual") as HTMLInputElement)?.checked)
                      accessibility.push("Visual impairment")

                    // Get notification preference
                    const notificationPreference = document.querySelector(
                      'input[name="radix-:r1m:"]:checked',
                    ) as HTMLInputElement

                    if (nameInput.value && contactInput.value && nhsInput.value && reasonInput.value) {
                      addToWaitingList(
                        nameInput.value,
                        contactInput.value,
                        emailInput.value,
                        nhsInput.value,
                        pharmacistSelect.value,
                        reasonInput.value,
                        urgencySelect.value as WaitingListPatient["urgency"],
                        preferredTimes,
                        (notificationPreference?.value || "sms") as WaitingListPatient["notificationPreference"],
                        accessibility,
                        notesInput.value,
                      )
                    }
                  }}
                >
                  Add to Waiting List
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
                <DialogDescription>
                  Schedule an appointment for {waitingList.find((p) => p.id === selectedPatient)?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="appointment-date">Date</Label>
                  <Input type="date" id="appointment-date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="appointment-time">Time</Label>
                  <Input type="time" id="appointment-time" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="appointment-pharmacist">Pharmacist</Label>
                  <Select
                    defaultValue={waitingList.find((p) => p.id === selectedPatient)?.preferredPharmacist || "any"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="James Williams">James Williams</SelectItem>
                      <SelectItem value="Emily Chen">Emily Chen</SelectItem>
                      <SelectItem value="Michael Roberts">Michael Roberts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="appointment-service">Service</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication-review">Medication Review</SelectItem>
                      <SelectItem value="flu-vaccination">Flu Vaccination</SelectItem>
                      <SelectItem value="blood-pressure">Blood Pressure Check</SelectItem>
                      <SelectItem value="new-medicine">New Medicine Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="send-confirmation" defaultChecked />
                  <Label htmlFor="send-confirmation">Send confirmation to patient</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmScheduleAppointment}>Schedule Appointment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/50">
          <div className="col-span-3">Patient</div>
          <div className="col-span-2">Added</div>
          <div className="col-span-2">Preferred Pharmacist</div>
          <div className="col-span-3">Reason</div>
          <div className="col-span-1">Urgency</div>
          <div className="col-span-1"></div>
        </div>

        {filteredWaitingList.length > 0 ? (
          filteredWaitingList.map((patient) => (
            <div key={patient.id} className="grid grid-cols-12 gap-4 p-4 border-b items-center">
              <div className="col-span-3">
                <div className="font-medium">{patient.name}</div>
                <div className="text-sm text-muted-foreground">{patient.contactNumber}</div>
                <div className="text-sm text-muted-foreground">NHS: {patient.nhsNumber}</div>
              </div>
              <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {patient.addedTime}, {patient.addedDate}
                </span>
              </div>
              <div className="col-span-2">{patient.preferredPharmacist}</div>
              <div className="col-span-3">
                <div>{patient.reason}</div>
                {patient.preferredTimes && patient.preferredTimes.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Preferred: {patient.preferredTimes.join(", ")}
                  </div>
                )}
                {patient.accessibility && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {patient.accessibility.map((need, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {need}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-1">{getUrgencyBadge(patient.urgency)}</div>
              <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => scheduleAppointment(patient.id)}>
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => sendNotification(patient.id)}>
                      <Bell className="mr-2 h-4 w-4" />
                      Send Notification
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => removeFromWaitingList(patient.id)}>
                      Remove from Waiting List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No patients in the waiting list match your criteria
          </div>
        )}
      </div>
    </div>
  )
}
