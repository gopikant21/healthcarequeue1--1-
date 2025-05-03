"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreHorizontal,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  AlertCircle,
  Calendar,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { format, addMinutes, differenceInMinutes } from "date-fns"

type QueueStatus = "waiting" | "in-progress" | "completed" | "no-show"

interface QueuePatient {
  id: string
  name: string
  queueNumber: number
  waitTime: number
  status: QueueStatus
  appointmentTime: string
  appointmentType: string
  nhsNumber?: string
  notes?: string
  checkedInFrom?: "home" | "kiosk" | "counter"
  estimatedTimeToSee?: string
  priority: "normal" | "urgent" | "priority"
  arrivalTime: Date
}

interface Pharmacist {
  id: string
  name: string
  specialty: string
  room: string
  avatar: string
  initials: string
  status: "available" | "busy" | "break" | "away"
  currentPatient: QueuePatient | null
  queue: QueuePatient[]
  estimatedTimePerPatient: number // in minutes
}

export function QueueManagement() {
  const { toast } = useToast()
  const [addPatientOpen, setAddPatientOpen] = useState(false)
  const [selectedPharmacist, setSelectedPharmacist] = useState<string | null>(null)
  const [expandedPharmacist, setExpandedPharmacist] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null)
  const [selectedPharmacistForTransfer, setSelectedPharmacistForTransfer] = useState<string | null>(null)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      specialty: "Clinical Pharmacist",
      room: "Consultation Room 1",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
      status: "busy",
      estimatedTimePerPatient: 15,
      currentPatient: {
        id: "p1",
        name: "John Smith",
        queueNumber: 1,
        waitTime: 0,
        status: "in-progress",
        appointmentTime: "09:00",
        appointmentType: "Medication Review",
        nhsNumber: "123 456 7890",
        checkedInFrom: "home",
        priority: "normal",
        arrivalTime: new Date(new Date().setMinutes(new Date().getMinutes() - 15)),
      },
      queue: [
        {
          id: "p2",
          name: "Emma Wilson",
          queueNumber: 2,
          waitTime: 10,
          status: "waiting",
          appointmentTime: "09:15",
          appointmentType: "Flu Vaccination",
          nhsNumber: "234 567 8901",
          checkedInFrom: "kiosk",
          estimatedTimeToSee: "09:25",
          priority: "normal",
          arrivalTime: new Date(new Date().setMinutes(new Date().getMinutes() - 10)),
        },
        {
          id: "p3",
          name: "Michael Brown",
          queueNumber: 3,
          waitTime: 25,
          status: "waiting",
          appointmentTime: "09:30",
          appointmentType: "New Medicine Service",
          nhsNumber: "345 678 9012",
          checkedInFrom: "counter",
          estimatedTimeToSee: "09:40",
          priority: "urgent",
          arrivalTime: new Date(new Date().setMinutes(new Date().getMinutes() - 25)),
          notes: "Patient has urgent medication review needed",
        },
      ],
    },
    {
      id: "2",
      name: "James Williams",
      specialty: "Pharmacy Manager",
      room: "Consultation Room 2",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JW",
      status: "available",
      estimatedTimePerPatient: 20,
      currentPatient: null,
      queue: [
        {
          id: "p4",
          name: "Sophie Taylor",
          queueNumber: 1,
          waitTime: 0,
          status: "waiting",
          appointmentTime: "09:15",
          appointmentType: "Blood Pressure Check",
          nhsNumber: "456 789 0123",
          checkedInFrom: "home",
          estimatedTimeToSee: "09:20",
          priority: "normal",
          arrivalTime: new Date(new Date().setMinutes(new Date().getMinutes() - 5)),
        },
      ],
    },
    {
      id: "3",
      name: "Emily Chen",
      specialty: "Pharmacist",
      room: "Consultation Room 3",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EC",
      status: "busy",
      estimatedTimePerPatient: 15,
      currentPatient: {
        id: "p5",
        name: "David Jones",
        queueNumber: 1,
        waitTime: 0,
        status: "in-progress",
        appointmentTime: "09:00",
        appointmentType: "Diabetes Review",
        nhsNumber: "567 890 1234",
        checkedInFrom: "kiosk",
        priority: "normal",
        arrivalTime: new Date(new Date().setMinutes(new Date().getMinutes() - 20)),
      },
      queue: [
        {
          id: "p6",
          name: "Lisa Anderson",
          queueNumber: 2,
          waitTime: 5,
          status: "waiting",
          appointmentTime: "09:15",
          appointmentType: "New Medicine Service",
          nhsNumber: "678 901 2345",
          checkedInFrom: "home",
          estimatedTimeToSee: "09:25",
          priority: "priority",
          arrivalTime: new Date(new Date().setMinutes(new Date().getMinutes() - 5)),
          notes: "Elderly patient with mobility issues",
        },
        {
          id: "p7",
          name: "Robert Martin",
          queueNumber: 3,
          waitTime: 20,
          status: "waiting",
          appointmentTime: "09:30",
          appointmentType: "Prescription Review",
          nhsNumber: "789 012 3456",
          checkedInFrom: "counter",
          estimatedTimeToSee: "09:40",
          priority: "normal",
          arrivalTime: new Date(new Date().setMinutes(new Date().getMinutes() - 20)),
        },
        {
          id: "p8",
          name: "Jennifer White",
          queueNumber: 4,
          waitTime: 35,
          status: "waiting",
          appointmentTime: "09:45",
          appointmentType: "Flu Vaccination",
          nhsNumber: "890 123 4567",
          checkedInFrom: "home",
          estimatedTimeToSee: "10:00",
          priority: "normal",
          arrivalTime: new Date(new Date().setMinutes(new Date().getMinutes() - 35)),
        },
      ],
    },
  ])

  const serviceTypes = [
    { id: "medication-review", name: "Medication Review" },
    { id: "flu-vaccination", name: "Flu Vaccination" },
    { id: "blood-pressure", name: "Blood Pressure Check" },
    { id: "diabetes-review", name: "Diabetes Review" },
    { id: "new-prescription", name: "New Prescription Consultation" },
    { id: "smoking-cessation", name: "Smoking Cessation" },
    { id: "travel-health", name: "Travel Health Consultation" },
    { id: "walk-in", name: "Walk-in Consultation" },
    { id: "nms", name: "New Medicine Service" },
    { id: "mur", name: "Medicines Use Review" },
  ]

  // Update wait times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setPharmacists((prevPharmacists) => {
        return prevPharmacists.map((pharmacist) => {
          const updatedQueue = pharmacist.queue.map((patient) => {
            const waitTime = differenceInMinutes(new Date(), patient.arrivalTime)
            return {
              ...patient,
              waitTime,
            }
          })

          return {
            ...pharmacist,
            queue: updatedQueue,
          }
        })
      })
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Filter pharmacists based on active tab
  const filteredPharmacists = pharmacists.filter((pharmacist) => {
    if (activeTab === "all") return true
    if (activeTab === "clinical") return pharmacist.specialty.toLowerCase().includes("clinical")
    if (activeTab === "dispensing") return pharmacist.specialty.toLowerCase().includes("pharmacy")
    if (activeTab === "technicians") return pharmacist.specialty.toLowerCase().includes("technician")
    return true
  })

  // Calculate estimated wait time for a patient
  const calculateEstimatedWaitTime = (pharmacist: Pharmacist, queuePosition: number): string => {
    if (!pharmacist.currentPatient) {
      return format(new Date(), "HH:mm")
    }

    // Calculate minutes to wait based on position and average time per patient
    const minutesToWait = queuePosition * pharmacist.estimatedTimePerPatient

    // Calculate estimated time
    const now = new Date()
    const estimatedTime = addMinutes(now, minutesToWait)

    return format(estimatedTime, "HH:mm")
  }

  // Update estimated times when component mounts
  useEffect(() => {
    // One-time calculation of estimated times
    const updatedPharmacists = pharmacists.map((pharmacist) => {
      const updatedQueue = pharmacist.queue.map((patient, index) => {
        return {
          ...patient,
          estimatedTimeToSee: calculateEstimatedWaitTime(pharmacist, index + 1),
        }
      })

      return {
        ...pharmacist,
        queue: updatedQueue,
      }
    })

    // Only update if there's a difference to avoid infinite loops
    if (JSON.stringify(updatedPharmacists) !== JSON.stringify(pharmacists)) {
      setPharmacists(updatedPharmacists)
    }
  }, []) // Empty dependency array - only run once on mount

  const completeCurrentPatient = (pharmacistId: string) => {
    setPharmacists((prevPharmacists) => {
      return prevPharmacists.map((pharmacist) => {
        if (pharmacist.id === pharmacistId && pharmacist.currentPatient) {
          // Move to next patient if available
          const nextPatient = pharmacist.queue.length > 0 ? pharmacist.queue[0] : null
          const newQueue = pharmacist.queue.slice(1)

          // Update estimated times for remaining queue
          const updatedQueue = newQueue.map((patient, index) => ({
            ...patient,
            queueNumber: index + 1,
            estimatedTimeToSee: calculateEstimatedWaitTime({ ...pharmacist, currentPatient: nextPatient }, index + 1),
          }))

          return {
            ...pharmacist,
            currentPatient: nextPatient,
            status: nextPatient ? "busy" : "available",
            queue: updatedQueue,
          }
        }
        return pharmacist
      })
    })

    toast({
      title: "Consultation completed",
      description: "The next patient has been called",
    })
  }

  const markNoShow = (pharmacistId: string) => {
    setPharmacists((prevPharmacists) => {
      return prevPharmacists.map((pharmacist) => {
        if (pharmacist.id === pharmacistId && pharmacist.currentPatient) {
          // Move to next patient if available
          const nextPatient = pharmacist.queue.length > 0 ? pharmacist.queue[0] : null
          const newQueue = pharmacist.queue.slice(1)

          // Update estimated times for remaining queue
          const updatedQueue = newQueue.map((patient, index) => ({
            ...patient,
            queueNumber: index + 1,
            estimatedTimeToSee: calculateEstimatedWaitTime({ ...pharmacist, currentPatient: nextPatient }, index + 1),
          }))

          return {
            ...pharmacist,
            currentPatient: nextPatient,
            status: nextPatient ? "busy" : "available",
            queue: updatedQueue,
          }
        }
        return pharmacist
      })
    })

    toast({
      title: "Patient marked as no-show",
      description: "The next patient has been called",
      variant: "destructive",
    })
  }

  const callNextPatient = (pharmacistId: string) => {
    setPharmacists((prevPharmacists) => {
      return prevPharmacists.map((pharmacist) => {
        if (pharmacist.id === pharmacistId && pharmacist.queue.length > 0 && !pharmacist.currentPatient) {
          const nextPatient = pharmacist.queue[0]
          const newQueue = pharmacist.queue.slice(1)

          // Update estimated times for remaining queue
          const updatedQueue = newQueue.map((patient, index) => ({
            ...patient,
            queueNumber: index + 1,
            estimatedTimeToSee: calculateEstimatedWaitTime({ ...pharmacist, currentPatient: nextPatient }, index + 1),
          }))

          return {
            ...pharmacist,
            currentPatient: nextPatient,
            status: "busy",
            queue: updatedQueue,
          }
        }
        return pharmacist
      })
    })

    toast({
      title: "Next patient called",
      description: "Patient has been notified via SMS",
    })
  }

  const sendReminder = (patientId: string) => {
    toast({
      title: "Reminder sent",
      description: "SMS reminder sent to patient",
    })
  }

  const movePatientInQueue = (pharmacistId: string, patientId: string, direction: "up" | "down") => {
    setPharmacists((prevPharmacists) => {
      return prevPharmacists.map((pharmacist) => {
        if (pharmacist.id === pharmacistId) {
          const queueCopy = [...pharmacist.queue]
          const patientIndex = queueCopy.findIndex((p) => p.id === patientId)

          if (patientIndex === -1) return pharmacist

          if (direction === "up" && patientIndex > 0) {
            // Swap with previous patient
            ;[queueCopy[patientIndex], queueCopy[patientIndex - 1]] = [
              queueCopy[patientIndex - 1],
              queueCopy[patientIndex],
            ]
          } else if (direction === "down" && patientIndex < queueCopy.length - 1) {
            // Swap with next patient
            ;[queueCopy[patientIndex], queueCopy[patientIndex + 1]] = [
              queueCopy[patientIndex + 1],
              queueCopy[patientIndex],
            ]
          }

          // Update queue numbers and estimated times
          const updatedQueue = queueCopy.map((patient, index) => ({
            ...patient,
            queueNumber: index + 1,
            estimatedTimeToSee: calculateEstimatedWaitTime(pharmacist, index + 1),
          }))

          return {
            ...pharmacist,
            queue: updatedQueue,
          }
        }
        return pharmacist
      })
    })

    toast({
      title: `Patient moved ${direction} in queue`,
      description: `Queue position updated and patient notified`,
    })
  }

  const transferPatient = () => {
    if (!selectedPatient || !selectedPharmacistForTransfer) return

    // Find source pharmacist
    const sourcePharmacist = pharmacists.find(
      (p) =>
        p.queue.some((patient) => patient.id === selectedPatient.id) ||
        (p.currentPatient && p.currentPatient.id === selectedPatient.id),
    )

    if (!sourcePharmacist) return

    // Find target pharmacist
    const targetPharmacist = pharmacists.find((p) => p.id === selectedPharmacistForTransfer)
    if (!targetPharmacist) return

    setPharmacists((prevPharmacists) => {
      return prevPharmacists.map((pharmacist) => {
        // Remove from source pharmacist
        if (pharmacist.id === sourcePharmacist.id) {
          // If it's the current patient
          if (pharmacist.currentPatient && pharmacist.currentPatient.id === selectedPatient.id) {
            const nextPatient = pharmacist.queue.length > 0 ? pharmacist.queue[0] : null
            const newQueue = pharmacist.queue.slice(1)

            // Update estimated times for remaining queue
            const updatedQueue = newQueue.map((patient, index) => ({
              ...patient,
              queueNumber: index + 1,
              estimatedTimeToSee: calculateEstimatedWaitTime({ ...pharmacist, currentPatient: nextPatient }, index + 1),
            }))

            return {
              ...pharmacist,
              currentPatient: nextPatient,
              status: nextPatient ? "busy" : "available",
              queue: updatedQueue,
            }
          }
          // If it's in the queue
          else {
            const updatedQueue = pharmacist.queue
              .filter((p) => p.id !== selectedPatient.id)
              .map((patient, index) => ({
                ...patient,
                queueNumber: index + 1,
                estimatedTimeToSee: calculateEstimatedWaitTime(pharmacist, index + 1),
              }))

            return {
              ...pharmacist,
              queue: updatedQueue,
            }
          }
        }

        // Add to target pharmacist
        if (pharmacist.id === targetPharmacist.id) {
          // If target has no current patient, make this the current
          if (!pharmacist.currentPatient) {
            return {
              ...pharmacist,
              currentPatient: selectedPatient,
              status: "busy",
            }
          }
          // Otherwise add to queue
          else {
            // Assign new queue number
            const newQueueNumber =
              pharmacist.queue.length > 0 ? Math.max(...pharmacist.queue.map((p) => p.queueNumber)) + 1 : 1

            const updatedQueue = [...pharmacist.queue, { ...selectedPatient, queueNumber: newQueueNumber }].map(
              (patient, index) => ({
                ...patient,
                queueNumber: index + 1,
                estimatedTimeToSee: calculateEstimatedWaitTime(pharmacist, index + 1),
              }),
            )

            return {
              ...pharmacist,
              queue: updatedQueue,
            }
          }
        }

        return pharmacist
      })
    })

    toast({
      title: "Patient transferred",
      description: `Patient transferred to ${targetPharmacist.name}`,
    })

    setTransferDialogOpen(false)
    setSelectedPharmacistForTransfer(null)
  }

  const addPatientToQueue = (
    pharmacistId: string,
    patientName: string,
    appointmentTime: string,
    appointmentType: string,
    priority: QueuePatient["priority"],
    nhsNumber?: string,
    notes?: string,
  ) => {
    setPharmacists((prevPharmacists) => {
      const updatedPharmacists = prevPharmacists.map((pharmacist) => {
        if (pharmacist.id === pharmacistId) {
          // Create new patient with next queue number
          const newQueueNumber =
            pharmacist.queue.length > 0
              ? Math.max(...pharmacist.queue.map((p) => p.queueNumber)) + 1
              : pharmacist.currentPatient
                ? 2
                : 1

          const newPatient: QueuePatient = {
            id: `p${Date.now()}`,
            name: patientName,
            queueNumber: newQueueNumber,
            waitTime: 0,
            status: "waiting",
            appointmentTime,
            appointmentType,
            nhsNumber,
            notes,
            checkedInFrom: "counter",
            priority,
            arrivalTime: new Date(),
          }

          // Sort queue by priority after adding new patient
          const newQueue = [...pharmacist.queue, newPatient].sort((a, b) => {
            // First sort by priority
            const priorityOrder = { urgent: 0, priority: 1, normal: 2 }
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
            if (priorityDiff !== 0) return priorityDiff

            // Then by wait time (longer wait time first)
            return b.waitTime - a.waitTime
          })

          // Update queue numbers and estimated times after sorting
          const updatedQueue = newQueue.map((patient, index) => {
            const estimatedTime = calculateEstimatedWaitTime(pharmacist, index + 1)
            return {
              ...patient,
              queueNumber: index + 1,
              estimatedTimeToSee: estimatedTime,
            }
          })

          return {
            ...pharmacist,
            queue: updatedQueue,
          }
        }
        return pharmacist
      })

      return updatedPharmacists
    })

    toast({
      title: "Patient added to queue",
      description: `${patientName} has been added to the queue`,
    })

    setAddPatientOpen(false)
  }

  const removeFromQueue = (pharmacistId: string, patientId: string) => {
    setPharmacists((prevPharmacists) => {
      return prevPharmacists.map((pharmacist) => {
        if (pharmacist.id === pharmacistId) {
          const updatedQueue = pharmacist.queue
            .filter((p) => p.id !== patientId)
            .map((patient, index) => ({
              ...patient,
              queueNumber: index + 1,
              estimatedTimeToSee: calculateEstimatedWaitTime(pharmacist, index + 1),
            }))

          return {
            ...pharmacist,
            queue: updatedQueue,
          }
        }
        return pharmacist
      })
    })

    toast({
      title: "Patient removed from queue",
      description: "Patient has been removed from the queue",
    })
  }

  const getStatusColor = (status: Pharmacist["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-amber-500"
      case "break":
        return "bg-blue-500"
      case "away":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityBadge = (priority: QueuePatient["priority"]) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>
      case "priority":
        return <Badge variant="secondary">Priority</Badge>
      case "normal":
        return <Badge variant="outline">Normal</Badge>
    }
  }

  const getCheckedInBadge = (method?: "home" | "kiosk" | "counter") => {
    switch (method) {
      case "home":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Home Check-in
          </Badge>
        )
      case "kiosk":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Kiosk Check-in
          </Badge>
        )
      case "counter":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Counter Check-in
          </Badge>
        )
      default:
        return null
    }
  }

  const toggleExpandPharmacist = (pharmacistId: string) => {
    setExpandedPharmacist(expandedPharmacist === pharmacistId ? null : pharmacistId)
  }

  // Filter patients based on search and status
  const getFilteredQueue = (pharmacist: Pharmacist) => {
    return pharmacist.queue.filter((patient) => {
      const matchesSearch =
        searchQuery === "" ||
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.nhsNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.appointmentType.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "waiting" && patient.status === "waiting") ||
        (statusFilter === "priority" && (patient.priority === "priority" || patient.priority === "urgent"))

      return matchesSearch && matchesStatus
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients, NHS numbers or services..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter patients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="waiting">Waiting Only</SelectItem>
              <SelectItem value="priority">Priority & Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={addPatientOpen} onOpenChange={setAddPatientOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add to Queue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Patient to Queue</DialogTitle>
                <DialogDescription>Add a walk-in or scheduled patient to a pharmacist's queue</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="pharmacist">Pharmacist</Label>
                  <Select onValueChange={setSelectedPharmacist}>
                    <SelectTrigger id="pharmacist">
                      <SelectValue placeholder="Select pharmacist" />
                    </SelectTrigger>
                    <SelectContent>
                      {pharmacists.map((pharmacist) => (
                        <SelectItem key={pharmacist.id} value={pharmacist.id}>
                          {pharmacist.name} ({pharmacist.specialty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="patient">Patient Name</Label>
                  <Input id="patient" placeholder="Enter patient name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nhs">NHS Number (optional)</Label>
                  <Input id="nhs" placeholder="Enter NHS number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="service">Service Type</Label>
                  <Select defaultValue="walk-in">
                    <SelectTrigger id="service">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Appointment Time</Label>
                  <Input type="time" id="time" defaultValue={format(new Date(), "HH:mm")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" placeholder="Any special requirements or notes" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddPatientOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const patientInput = document.getElementById("patient") as HTMLInputElement
                    const nhsInput = document.getElementById("nhs") as HTMLInputElement
                    const timeInput = document.getElementById("time") as HTMLInputElement
                    const serviceSelect = document.getElementById("service") as HTMLSelectElement
                    const prioritySelect = document.getElementById("priority") as HTMLSelectElement
                    const notesInput = document.getElementById("notes") as HTMLTextAreaElement

                    if (selectedPharmacist && patientInput.value) {
                      const serviceName =
                        serviceTypes.find((s) => s.id === serviceSelect.value)?.name || "Walk-in Consultation"

                      addPatientToQueue(
                        selectedPharmacist,
                        patientInput.value,
                        timeInput.value,
                        serviceName,
                        prioritySelect.value as QueuePatient["priority"],
                        nhsInput.value,
                        notesInput.value,
                      )
                    }
                  }}
                >
                  Add to Queue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Patient Details Dialog */}
      <Dialog open={patientDetailsOpen} onOpenChange={setPatientDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle>Patient Details</DialogTitle>
                <DialogDescription>
                  Queue #{selectedPatient.queueNumber} • {selectedPatient.appointmentTime}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg">{selectedPatient.name}</h3>
                  <div className="flex gap-2">
                    {getPriorityBadge(selectedPatient.priority)}
                    {getCheckedInBadge(selectedPatient.checkedInFrom)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">NHS Number</p>
                    <p className="text-sm text-muted-foreground">{selectedPatient.nhsNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Service</p>
                    <p className="text-sm text-muted-foreground">{selectedPatient.appointmentType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Wait Time</p>
                    <p className="text-sm text-muted-foreground">{selectedPatient.waitTime} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estimated Time</p>
                    <p className="text-sm text-muted-foreground">{selectedPatient.estimatedTimeToSee || "Unknown"}</p>
                  </div>
                </div>

                {selectedPatient.notes && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Notes
                    </p>
                    <p className="text-sm mt-1">{selectedPatient.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <div className="flex w-full justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPatientDetailsOpen(false)
                      setTransferDialogOpen(true)
                    }}
                  >
                    Transfer Patient
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        sendReminder(selectedPatient.id)
                        setPatientDetailsOpen(false)
                      }}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Send Reminder
                    </Button>
                    <Button onClick={() => setPatientDetailsOpen(false)}>Close</Button>
                  </div>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Patient Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Transfer Patient</DialogTitle>
            <DialogDescription>Select a pharmacist to transfer {selectedPatient?.name} to</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="transfer-pharmacist">Pharmacist</Label>
              <Select onValueChange={setSelectedPharmacistForTransfer}>
                <SelectTrigger id="transfer-pharmacist">
                  <SelectValue placeholder="Select pharmacist" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacists
                    .filter(
                      (p) =>
                        !p.queue.some((patient) => patient.id === selectedPatient?.id) &&
                        !(p.currentPatient && p.currentPatient.id === selectedPatient?.id),
                    )
                    .map((pharmacist) => (
                      <SelectItem key={pharmacist.id} value={pharmacist.id}>
                        {pharmacist.name} ({pharmacist.queue.length} in queue)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={transferPatient} disabled={!selectedPharmacistForTransfer}>
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredPharmacists.map((pharmacist) => (
        <Card key={pharmacist.id} className="overflow-hidden">
          <div
            className="bg-muted/30 p-4 cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => toggleExpandPharmacist(pharmacist.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={pharmacist.avatar || "/placeholder.svg"} alt={pharmacist.name} />
                  <AvatarFallback>{pharmacist.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{pharmacist.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{pharmacist.specialty}</span>
                    <span>•</span>
                    <span>{pharmacist.room}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(pharmacist.status)}`} />
                  <span className="text-sm capitalize">{pharmacist.status}</span>
                </div>
                <Badge variant="outline">
                  {pharmacist.currentPatient
                    ? "In Session"
                    : pharmacist.queue.length > 0
                      ? `${pharmacist.queue.length} Waiting`
                      : "No Patients"}
                </Badge>
                {expandedPharmacist === pharmacist.id ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {expandedPharmacist === pharmacist.id && (
            <CardContent className="p-4 pt-5">
              <div className="space-y-4">
                {/* Current Patient */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Current Patient</h4>
                  {pharmacist.currentPatient ? (
                    <div className="rounded-md bg-muted p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="text-lg h-8 w-8 rounded-full flex items-center justify-center"
                          >
                            {pharmacist.currentPatient.queueNumber}
                          </Badge>
                          <div>
                            <p className="font-medium">{pharmacist.currentPatient.name}</p>
                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-xs text-muted-foreground">
                              <span>Appointment: {pharmacist.currentPatient.appointmentTime}</span>
                              <span className="hidden md:inline">•</span>
                              <span>{pharmacist.currentPatient.appointmentType}</span>
                              {pharmacist.currentPatient.nhsNumber && (
                                <>
                                  <span className="hidden md:inline">•</span>
                                  <span>NHS: {pharmacist.currentPatient.nhsNumber}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => completeCurrentPatient(pharmacist.id)}>
                            <UserCheck className="mr-1 h-4 w-4" />
                            Complete
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => markNoShow(pharmacist.id)}>
                            <UserX className="mr-1 h-4 w-4" />
                            No-show
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span>In progress</span>
                          <span>~{pharmacist.estimatedTimePerPatient} min consultation</span>
                        </div>
                        <Progress value={33} className="h-2 mt-1" />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md bg-muted p-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">No active patient</p>
                      {pharmacist.queue.length > 0 ? (
                        <Button size="sm" onClick={() => callNextPatient(pharmacist.id)}>
                          Call Next Patient
                        </Button>
                      ) : (
                        <Badge variant="outline">Queue Empty</Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Queue */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">
                      Queue ({getFilteredQueue(pharmacist).length}/{pharmacist.queue.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPharmacist(pharmacist.id)
                        setAddPatientOpen(true)
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add Patient
                    </Button>
                  </div>

                  {pharmacist.queue.length > 0 ? (
                    <div className="space-y-2">
                      {getFilteredQueue(pharmacist).map((patient, index) => (
                        <div
                          key={patient.id}
                          className="flex flex-col md:flex-row md:items-center justify-between rounded-md border p-3 gap-2 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedPatient(patient)
                            setPatientDetailsOpen(true)
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                patient.priority === "urgent"
                                  ? "destructive"
                                  : patient.priority === "priority"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="h-6 w-6 rounded-full flex items-center justify-center"
                            >
                              {patient.queueNumber}
                            </Badge>
                            <div>
                              <span className="font-medium">{patient.name}</span>
                              <div className="text-xs text-muted-foreground">
                                {patient.appointmentType}
                                {patient.nhsNumber && <> • NHS: {patient.nhsNumber}</>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-9 md:ml-0">
                            <span className="text-xs text-muted-foreground">{patient.appointmentTime}</span>
                            <Badge variant={patient.waitTime > 15 ? "destructive" : "secondary"}>
                              {patient.waitTime} min wait
                            </Badge>
                            {getCheckedInBadge(patient.checkedInFrom)}
                            <TooltipProvider>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      sendReminder(patient.id)
                                    }}
                                  >
                                    <Bell className="mr-2 h-4 w-4" />
                                    Send Reminder
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Schedule Appointment
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      movePatientInQueue(pharmacist.id, patient.id, "up")
                                    }}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="mr-2 h-4 w-4" />
                                    Move Up
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      movePatientInQueue(pharmacist.id, patient.id, "down")
                                    }}
                                    disabled={index === pharmacist.queue.length - 1}
                                  >
                                    <ArrowDown className="mr-2 h-4 w-4" />
                                    Move Down
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedPatient(patient)
                                      setTransferDialogOpen(true)
                                    }}
                                  >
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Transfer Patient
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeFromQueue(pharmacist.id, patient.id)
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Remove from Queue
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                      {pharmacist.queue.length > getFilteredQueue(pharmacist).length && (
                        <div className="text-center text-sm text-muted-foreground">
                          {pharmacist.queue.length - getFilteredQueue(pharmacist).length} patients hidden by filters
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                      No patients waiting
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
