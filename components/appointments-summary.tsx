"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Pill, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type AppointmentStatus = "scheduled" | "checked-in" | "in-progress" | "completed" | "cancelled" | "no-show"

interface Appointment {
  id: string
  patientName: string
  pharmacistName: string
  time: string
  duration: string
  room: string
  status: AppointmentStatus
  appointmentType: string
  nhsNumber?: string
  notes?: string
  accessibility?: string[]
}

export function AppointmentsSummary() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      patientName: "John Smith",
      pharmacistName: "Sarah Johnson",
      time: "09:00",
      duration: "15 min",
      room: "Consultation Room 1",
      status: "in-progress",
      appointmentType: "Medication Review",
      nhsNumber: "1234567890",
    },
    {
      id: "2",
      patientName: "Emma Wilson",
      pharmacistName: "Sarah Johnson",
      time: "09:15",
      duration: "15 min",
      room: "Consultation Room 1",
      status: "checked-in",
      appointmentType: "Flu Vaccination",
      nhsNumber: "2345678901",
    },
    {
      id: "3",
      patientName: "Michael Brown",
      pharmacistName: "Sarah Johnson",
      time: "09:30",
      duration: "15 min",
      room: "Consultation Room 1",
      status: "scheduled",
      appointmentType: "New Medicine Service",
      nhsNumber: "3456789012",
      accessibility: ["Wheelchair access", "Hearing impaired"],
      notes: "Patient is on multiple medications, comprehensive review needed",
    },
    {
      id: "4",
      patientName: "Sophie Taylor",
      pharmacistName: "James Williams",
      time: "09:15",
      duration: "30 min",
      room: "Consultation Room 2",
      status: "scheduled",
      appointmentType: "Blood Pressure Check",
      nhsNumber: "4567890123",
    },
    {
      id: "5",
      patientName: "David Jones",
      pharmacistName: "Emily Chen",
      time: "09:00",
      duration: "15 min",
      room: "Consultation Room 3",
      status: "in-progress",
      appointmentType: "Diabetes Review",
      nhsNumber: "5678901234",
    },
    {
      id: "6",
      patientName: "Lisa Anderson",
      pharmacistName: "Emily Chen",
      time: "09:15",
      duration: "15 min",
      room: "Consultation Room 3",
      status: "checked-in",
      appointmentType: "New Medicine Service",
      nhsNumber: "6789012345",
      notes: "First prescription for blood pressure medication",
    },
    {
      id: "6",
      patientName: "Lisa Anderson",
      pharmacistName: "Emily Chen",
      time: "09:15",
      duration: "15 min",
      room: "Consultation Room 3",
      status: "checked-in",
      appointmentType: "New Medicine Service",
      nhsNumber: "6789012345",
      notes: "First prescription for blood pressure medication",
    },
  ])

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      case "checked-in":
        return <Badge variant="secondary">Checked In</Badge>
      case "in-progress":
        return <Badge variant="default">In Progress</Badge>
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "no-show":
        return <Badge variant="destructive">No Show</Badge>
    }
  }

  const checkInPatient = (id: string) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status: "checked-in" } : appointment,
      ),
    )

    toast({
      title: "Patient checked in",
      description: "Patient has been added to the queue",
    })
  }

  return (
    <ScrollArea className="pr-4">
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="flex flex-col space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{appointment.patientName}</h4>
              {getStatusBadge(appointment.status)}
            </div>
            <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Pill className="mr-2 h-4 w-4" />
                <span>{appointment.appointmentType}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{appointment.pharmacistName}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>
                  {appointment.time} ({appointment.duration})
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{appointment.room}</span>
              </div>
              {appointment.nhsNumber && <div className="text-xs">NHS: {appointment.nhsNumber}</div>}
            </div>

            {appointment.accessibility && appointment.accessibility.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {appointment.accessibility.map((need, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    {need}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              {appointment.notes ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Has notes</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{appointment.notes}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div></div>
              )}

              {appointment.status === "scheduled" && (
                <Button size="sm" onClick={() => checkInPatient(appointment.id)}>
                  Check In
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
