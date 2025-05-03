"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ActivityItem {
  id: string
  patientName: string
  patientAvatar: string
  patientInitials: string
  action: string
  doctorName: string
  time: string
  status: "success" | "warning" | "error" | "info"
}

export function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      id: "1",
      patientName: "John Smith",
      patientAvatar: "/placeholder.svg?height=32&width=32",
      patientInitials: "JS",
      action: "started consultation with",
      doctorName: "Dr. Sarah Johnson",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: "2",
      patientName: "Emma Wilson",
      patientAvatar: "/placeholder.svg?height=32&width=32",
      patientInitials: "EW",
      action: "checked in for appointment with",
      doctorName: "Dr. Sarah Johnson",
      time: "5 minutes ago",
      status: "info",
    },
    {
      id: "3",
      patientName: "Lisa Anderson",
      patientAvatar: "/placeholder.svg?height=32&width=32",
      patientInitials: "LA",
      action: "checked in for appointment with",
      doctorName: "Dr. Emily Chen",
      time: "10 minutes ago",
      status: "info",
    },
    {
      id: "4",
      patientName: "David Jones",
      patientAvatar: "/placeholder.svg?height=32&width=32",
      patientInitials: "DJ",
      action: "started consultation with",
      doctorName: "Dr. Emily Chen",
      time: "15 minutes ago",
      status: "success",
    },
    {
      id: "5",
      patientName: "Robert Martin",
      patientAvatar: "/placeholder.svg?height=32&width=32",
      patientInitials: "RM",
      action: "rescheduled appointment with",
      doctorName: "Dr. Emily Chen",
      time: "25 minutes ago",
      status: "warning",
    },
    {
      id: "6",
      patientName: "Jennifer White",
      patientAvatar: "/placeholder.svg?height=32&width=32",
      patientInitials: "JW",
      action: "missed appointment with",
      doctorName: "Dr. James Williams",
      time: "30 minutes ago",
      status: "error",
    },
    {
      id: "7",
      patientName: "Thomas Brown",
      patientAvatar: "/placeholder.svg?height=32&width=32",
      patientInitials: "TB",
      action: "completed consultation with",
      doctorName: "Dr. James Williams",
      time: "45 minutes ago",
      status: "success",
    },
  ]

  const getStatusColor = (status: ActivityItem["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-amber-500"
      case "error":
        return "bg-red-500"
      case "info":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.patientAvatar || "/placeholder.svg"} alt={activity.patientName} />
              <AvatarFallback>{activity.patientInitials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.patientName}</span> {activity.action}{" "}
                <span className="font-medium">{activity.doctorName}</span>
              </p>
              <div className="flex items-center">
                <div className={`mr-2 h-2 w-2 rounded-full ${getStatusColor(activity.status)}`} />
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
