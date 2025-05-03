"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MoreHorizontal, Search, UserPlus } from "lucide-react"
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

interface WaitlistPatient {
  id: string
  name: string
  contactNumber: string
  preferredDoctor: string
  reason: string
  urgency: "low" | "medium" | "high"
  addedTime: string
  addedDate: string
  notes?: string
}

export function WaitlistManagement() {
  const { toast } = useToast()
  const [addPatientOpen, setAddPatientOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")

  const [waitlist, setWaitlist] = useState<WaitlistPatient[]>([
    {
      id: "w1",
      name: "Thomas Brown",
      contactNumber: "07700 900123",
      preferredDoctor: "Dr. Sarah Johnson",
      reason: "Persistent cough",
      urgency: "medium",
      addedTime: "08:30",
      addedDate: "Today",
      notes: "Patient prefers afternoon appointments",
    },
    {
      id: "w2",
      name: "Rebecca Clark",
      contactNumber: "07700 900456",
      preferredDoctor: "Dr. James Williams",
      reason: "Dental pain",
      urgency: "high",
      addedTime: "09:15",
      addedDate: "Today",
      notes: "Patient is in significant pain",
    },
    {
      id: "w3",
      name: "George Wilson",
      contactNumber: "07700 900789",
      preferredDoctor: "Any",
      reason: "Prescription renewal",
      urgency: "low",
      addedTime: "10:45",
      addedDate: "Today",
    },
    {
      id: "w4",
      name: "Olivia Martinez",
      contactNumber: "07700 900234",
      preferredDoctor: "Dr. Emily Chen",
      reason: "Medication review",
      urgency: "medium",
      addedTime: "14:20",
      addedDate: "Yesterday",
    },
    {
      id: "w5",
      name: "William Johnson",
      contactNumber: "07700 900567",
      preferredDoctor: "Dr. Michael Roberts",
      reason: "Follow-up appointment",
      urgency: "low",
      addedTime: "16:05",
      addedDate: "Yesterday",
    },
  ])

  const addToWaitlist = (
    name: string,
    contactNumber: string,
    preferredDoctor: string,
    reason: string,
    urgency: WaitlistPatient["urgency"],
    notes?: string,
  ) => {
    const newPatient: WaitlistPatient = {
      id: `w${Date.now()}`,
      name,
      contactNumber,
      preferredDoctor,
      reason,
      urgency,
      addedTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      addedDate: "Today",
      notes,
    }

    setWaitlist([newPatient, ...waitlist])

    toast({
      title: "Patient added to waitlist",
      description: `${name} has been added to the waitlist`,
    })

    setAddPatientOpen(false)
  }

  const removeFromWaitlist = (id: string) => {
    setWaitlist(waitlist.filter((patient) => patient.id !== id))

    toast({
      title: "Patient removed from waitlist",
      description: "Patient has been removed from the waitlist",
    })
  }

  const scheduleAppointment = (id: string) => {
    // In a real app, this would open the appointment scheduling dialog
    // For now, we'll just remove from waitlist
    removeFromWaitlist(id)

    toast({
      title: "Appointment scheduled",
      description: "Patient has been scheduled for an appointment",
      variant: "success",
    })
  }

  const getUrgencyBadge = (urgency: WaitlistPatient["urgency"]) => {
    switch (urgency) {
      case "low":
        return <Badge variant="outline">Low</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "high":
        return <Badge variant="destructive">High</Badge>
    }
  }

  const filteredWaitlist = waitlist.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.reason.toLowerCase().includes(searchQuery.toLowerCase())

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
              placeholder="Search patients or reasons..."
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
                Add to Waitlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Patient to Waitlist</DialogTitle>
                <DialogDescription>Add a patient to the waitlist for the next available appointment</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Patient Name</Label>
                  <Input id="name" placeholder="Enter patient name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input id="contact" placeholder="Enter contact number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doctor">Preferred Doctor</Label>
                  <Select defaultValue="any">
                    <SelectTrigger id="doctor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Available Doctor</SelectItem>
                      <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
                      <SelectItem value="Dr. James Williams">Dr. James Williams</SelectItem>
                      <SelectItem value="Dr. Emily Chen">Dr. Emily Chen</SelectItem>
                      <SelectItem value="Dr. Michael Roberts">Dr. Michael Roberts</SelectItem>
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
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input id="notes" placeholder="Any additional notes" />
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
                    const doctorSelect = document.getElementById("doctor") as HTMLSelectElement
                    const reasonInput = document.getElementById("reason") as HTMLInputElement
                    const urgencySelect = document.getElementById("urgency") as HTMLSelectElement
                    const notesInput = document.getElementById("notes") as HTMLInputElement

                    if (nameInput.value && contactInput.value && reasonInput.value) {
                      addToWaitlist(
                        nameInput.value,
                        contactInput.value,
                        doctorSelect.value,
                        reasonInput.value,
                        urgencySelect.value as WaitlistPatient["urgency"],
                        notesInput.value,
                      )
                    }
                  }}
                >
                  Add to Waitlist
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/50">
          <div className="col-span-3">Patient</div>
          <div className="col-span-2">Added</div>
          <div className="col-span-2">Preferred Doctor</div>
          <div className="col-span-3">Reason</div>
          <div className="col-span-1">Urgency</div>
          <div className="col-span-1"></div>
        </div>

        {filteredWaitlist.length > 0 ? (
          filteredWaitlist.map((patient) => (
            <div key={patient.id} className="grid grid-cols-12 gap-4 p-4 border-b items-center">
              <div className="col-span-3">
                <div className="font-medium">{patient.name}</div>
                <div className="text-sm text-muted-foreground">{patient.contactNumber}</div>
              </div>
              <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {patient.addedTime}, {patient.addedDate}
                </span>
              </div>
              <div className="col-span-2">{patient.preferredDoctor}</div>
              <div className="col-span-3">{patient.reason}</div>
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
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => removeFromWaitlist(patient.id)}>
                      Remove from Waitlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">No patients in the waitlist match your criteria</div>
        )}
      </div>
    </div>
  )
}
