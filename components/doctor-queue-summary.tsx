"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, UserCheck, UserX } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type QueueStatus = "waiting" | "in-progress" | "completed" | "no-show"

interface QueuePatient {
  id: string
  name: string
  queueNumber: number
  waitTime: number
  status: QueueStatus
  appointmentTime: string
}

interface Doctor {
  id: string
  name: string
  specialty: string
  room: string
  avatar: string
  initials: string
  status: "available" | "busy" | "break" | "away"
  currentPatient: QueuePatient | null
  queue: QueuePatient[]
}

export function DoctorQueueSummary() {
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "General Practitioner",
      room: "Room 101",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
      status: "busy",
      currentPatient: {
        id: "p1",
        name: "John Smith",
        queueNumber: 1,
        waitTime: 0,
        status: "in-progress",
        appointmentTime: "09:00",
      },
      queue: [
        {
          id: "p2",
          name: "Emma Wilson",
          queueNumber: 2,
          waitTime: 10,
          status: "waiting",
          appointmentTime: "09:15",
        },
        {
          id: "p3",
          name: "Michael Brown",
          queueNumber: 3,
          waitTime: 25,
          status: "waiting",
          appointmentTime: "09:30",
        },
      ],
    },
    {
      id: "2",
      name: "Dr. James Williams",
      specialty: "Dentist",
      room: "Room 102",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JW",
      status: "available",
      currentPatient: null,
      queue: [
        {
          id: "p4",
          name: "Sophie Taylor",
          queueNumber: 1,
          waitTime: 0,
          status: "waiting",
          appointmentTime: "09:15",
        },
      ],
    },
    {
      id: "3",
      name: "Dr. Emily Chen",
      specialty: "Pharmacist",
      room: "Room 103",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EC",
      status: "busy",
      currentPatient: {
        id: "p5",
        name: "David Jones",
        queueNumber: 1,
        waitTime: 0,
        status: "in-progress",
        appointmentTime: "09:00",
      },
      queue: [
        {
          id: "p6",
          name: "Lisa Anderson",
          queueNumber: 2,
          waitTime: 5,
          status: "waiting",
          appointmentTime: "09:15",
        },
        {
          id: "p7",
          name: "Robert Martin",
          queueNumber: 3,
          waitTime: 20,
          status: "waiting",
          appointmentTime: "09:30",
        },
        {
          id: "p8",
          name: "Jennifer White",
          queueNumber: 4,
          waitTime: 35,
          status: "waiting",
          appointmentTime: "09:45",
        },
      ],
    },
  ])

  const completeCurrentPatient = (doctorId: string) => {
    setDoctors(
      doctors.map((doctor) => {
        if (doctor.id === doctorId && doctor.currentPatient) {
          // Move to next patient if available
          const nextPatient = doctor.queue.length > 0 ? doctor.queue[0] : null
          const newQueue = doctor.queue.slice(1)

          return {
            ...doctor,
            currentPatient: nextPatient,
            status: nextPatient ? "busy" : "available",
            queue: newQueue,
          }
        }
        return doctor
      }),
    )

    toast({
      title: "Patient consultation completed",
      description: "The next patient has been called",
    })
  }

  const markNoShow = (doctorId: string) => {
    setDoctors(
      doctors.map((doctor) => {
        if (doctor.id === doctorId && doctor.currentPatient) {
          // Move to next patient if available
          const nextPatient = doctor.queue.length > 0 ? doctor.queue[0] : null
          const newQueue = doctor.queue.slice(1)

          return {
            ...doctor,
            currentPatient: nextPatient,
            status: nextPatient ? "busy" : "available",
            queue: newQueue,
          }
        }
        return doctor
      }),
    )

    toast({
      title: "Patient marked as no-show",
      description: "The next patient has been called",
      variant: "destructive",
    })
  }

  const callNextPatient = (doctorId: string) => {
    setDoctors(
      doctors.map((doctor) => {
        if (doctor.id === doctorId && doctor.queue.length > 0 && !doctor.currentPatient) {
          const nextPatient = doctor.queue[0]
          const newQueue = doctor.queue.slice(1)

          return {
            ...doctor,
            currentPatient: nextPatient,
            status: "busy",
            queue: newQueue,
          }
        }
        return doctor
      }),
    )

    toast({
      title: "Next patient called",
      description: "Patient has been notified",
    })
  }

  const getStatusColor = (status: Doctor["status"]) => {
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

  return (
    <div className="space-y-6">
      {doctors.map((doctor) => (
        <div key={doctor.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={doctor.avatar || "/placeholder.svg"} alt={doctor.name} />
                <AvatarFallback>{doctor.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{doctor.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{doctor.specialty}</span>
                  <span>•</span>
                  <span>{doctor.room}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(doctor.status)}`} />
              <span className="text-sm capitalize">{doctor.status}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {doctor.currentPatient ? (
              <div className="rounded-md bg-muted p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="text-lg h-8 w-8 rounded-full flex items-center justify-center"
                    >
                      {doctor.currentPatient.queueNumber}
                    </Badge>
                    <div>
                      <p className="font-medium">{doctor.currentPatient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Appointment: {doctor.currentPatient.appointmentTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => completeCurrentPatient(doctor.id)}>
                      <UserCheck className="mr-1 h-4 w-4" />
                      Complete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => markNoShow(doctor.id)}>
                      <UserX className="mr-1 h-4 w-4" />
                      No-show
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>In progress</span>
                    <span>~15 min consultation</span>
                  </div>
                  <Progress value={33} className="h-2 mt-1" />
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-muted p-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">No active patient</p>
                {doctor.queue.length > 0 ? (
                  <Button size="sm" onClick={() => callNextPatient(doctor.id)}>
                    Call Next Patient
                  </Button>
                ) : (
                  <Badge variant="outline">Queue Empty</Badge>
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Waiting ({doctor.queue.length})</h4>
                <Button variant="ghost" size="sm" className="h-7 gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {doctor.queue.length > 0 ? (
                <div className="space-y-2">
                  {doctor.queue.slice(0, 3).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between rounded-md border p-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center">
                          {patient.queueNumber}
                        </Badge>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{patient.appointmentTime}</span>
                        <Badge variant={patient.waitTime > 15 ? "destructive" : "secondary"}>
                          {patient.waitTime} min wait
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {doctor.queue.length > 3 && (
                    <div className="text-center text-sm text-muted-foreground">
                      +{doctor.queue.length - 3} more patients in queue
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                  No patients waiting
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
