"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pill, Stethoscope, Clipboard, Syringe, Thermometer, Droplet } from "lucide-react"

interface StaffMember {
  id: string
  name: string
  role: string
  avatar: string
  initials: string
  status: "available" | "busy" | "break" | "away" | "off"
  schedule: {
    start: string
    end: string
  }
  services: string[]
}

export function StaffAvailability() {
  const [staff] = useState<StaffMember[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Pharmacist",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
      status: "busy",
      schedule: {
        start: "09:00",
        end: "17:30",
      },
      services: ["Medication Review", "Flu Vaccination", "New Medicine Service"],
    },
    {
      id: "2",
      name: "James Williams",
      role: "Pharmacy Manager",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JW",
      status: "available",
      schedule: {
        start: "08:30",
        end: "18:00",
      },
      services: ["Medication Review", "Travel Vaccination", "Smoking Cessation"],
    },
    {
      id: "3",
      name: "Emily Chen",
      role: "Pharmacist",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EC",
      status: "busy",
      schedule: {
        start: "09:00",
        end: "17:00",
      },
      services: ["Medication Review", "Blood Pressure Check", "Diabetes Review"],
    },
    {
      id: "4",
      name: "Michael Roberts",
      role: "Pharmacy Technician",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MR",
      status: "break",
      schedule: {
        start: "08:00",
        end: "16:00",
      },
      services: ["Prescription Collection", "Medicine Delivery"],
    },
    {
      id: "5",
      name: "Lisa Thompson",
      role: "Pharmacy Assistant",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "LT",
      status: "available",
      schedule: {
        start: "10:00",
        end: "18:00",
      },
      services: ["Prescription Collection", "OTC Advice"],
    },
    {
      id: "6",
      name: "David Wilson",
      role: "Pharmacist",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DW",
      status: "off",
      schedule: {
        start: "00:00",
        end: "00:00",
      },
      services: ["Medication Review", "Flu Vaccination", "Travel Vaccination"],
    },
  ])

  const getStatusColor = (status: StaffMember["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-amber-500"
      case "break":
        return "bg-blue-500"
      case "away":
        return "bg-gray-500"
      case "off":
        return "bg-red-300"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: StaffMember["status"]) => {
    switch (status) {
      case "available":
        return "Available"
      case "busy":
        return "With Patient"
      case "break":
        return "On Break"
      case "away":
        return "Away"
      case "off":
        return "Off Duty"
      default:
        return status
    }
  }

  const getServiceIcon = (service: string) => {
    if (service.includes("Medication") || service.includes("Medicine")) return <Pill className="h-3 w-3" />
    if (service.includes("Vaccination") || service.includes("Flu")) return <Syringe className="h-3 w-3" />
    if (service.includes("Blood")) return <Droplet className="h-3 w-3" />
    if (service.includes("Prescription")) return <Clipboard className="h-3 w-3" />
    if (service.includes("Temperature") || service.includes("Diabetes")) return <Thermometer className="h-3 w-3" />
    return <Stethoscope className="h-3 w-3" />
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {staff.map((member) => (
          <div key={member.id} className="flex items-start space-x-4 p-3 rounded-md border">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{member.name}</p>
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(member.status)}`} />
                  <span className="text-xs capitalize">{getStatusText(member.status)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{member.role}</p>

              {member.status !== "off" && (
                <div className="text-xs text-muted-foreground">
                  {member.schedule.start} - {member.schedule.end}
                </div>
              )}

              <div className="flex flex-wrap gap-1 mt-1">
                {member.services.map((service, index) => (
                  <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                    {getServiceIcon(service)}
                    <span>{service}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
