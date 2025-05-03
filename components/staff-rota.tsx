"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarPlus, Clock, Edit, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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
import { Checkbox } from "@/components/ui/checkbox"

interface StaffMember {
  id: string
  name: string
  role: string
  avatar: string
  initials: string
}

interface ScheduleEntry {
  id: string
  staffId: string
  date: Date
  startTime: string
  endTime: string
  status: "available" | "training" | "leave" | "sick" | "off"
  services: string[]
}

export function StaffRota() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date>(new Date())
  const [addScheduleOpen, setAddScheduleOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<string>("week")

  const staff: StaffMember[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Pharmacist",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
    },
    {
      id: "2",
      name: "James Williams",
      role: "Pharmacy Manager",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JW",
    },
    {
      id: "3",
      name: "Emily Chen",
      role: "Pharmacist",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "EC",
    },
    {
      id: "4",
      name: "Michael Roberts",
      role: "Pharmacy Technician",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MR",
    },
    {
      id: "5",
      name: "Lisa Thompson",
      role: "Pharmacy Assistant",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "LT",
    },
    {
      id: "6",
      name: "David Wilson",
      role: "Pharmacist",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DW",
    },
  ]

  const [schedules, setSchedules] = useState<ScheduleEntry[]>([
    {
      id: "s1",
      staffId: "1",
      date: new Date(),
      startTime: "09:00",
      endTime: "17:30",
      status: "available",
      services: ["Medication Review", "Flu Vaccination", "New Medicine Service"],
    },
    {
      id: "s2",
      staffId: "2",
      date: new Date(),
      startTime: "08:30",
      endTime: "18:00",
      status: "available",
      services: ["Medication Review", "Travel Vaccination", "Smoking Cessation"],
    },
    {
      id: "s3",
      staffId: "3",
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      status: "available",
      services: ["Medication Review", "Blood Pressure Check", "Diabetes Review"],
    },
    {
      id: "s4",
      staffId: "4",
      date: new Date(),
      startTime: "08:00",
      endTime: "16:00",
      status: "available",
      services: ["Prescription Collection", "Medicine Delivery"],
    },
    {
      id: "s5",
      staffId: "5",
      date: new Date(),
      startTime: "10:00",
      endTime: "18:00",
      status: "available",
      services: ["Prescription Collection", "OTC Advice"],
    },
    {
      id: "s6",
      staffId: "6",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      startTime: "09:00",
      endTime: "17:00",
      status: "available",
      services: ["Medication Review", "Flu Vaccination", "Travel Vaccination"],
    },
    {
      id: "s7",
      staffId: "1",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      startTime: "09:00",
      endTime: "17:30",
      status: "training",
      services: [],
    },
    {
      id: "s8",
      staffId: "3",
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      startTime: "00:00",
      endTime: "00:00",
      status: "leave",
      services: [],
    },
  ])

  const services = [
    "Medication Review",
    "Flu Vaccination",
    "Travel Vaccination",
    "New Medicine Service",
    "Blood Pressure Check",
    "Diabetes Review",
    "Smoking Cessation",
    "Prescription Collection",
    "Medicine Delivery",
    "OTC Advice",
  ]

  const filteredSchedules = schedules.filter((schedule) => schedule.date.toDateString() === date.toDateString())

  const getStatusColor = (status: ScheduleEntry["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "training":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "leave":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "sick":
        return "bg-red-100 text-red-800 border-red-200"
      case "off":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: ScheduleEntry["status"]) => {
    switch (status) {
      case "available":
        return "Available"
      case "training":
        return "Training"
      case "leave":
        return "Annual Leave"
      case "sick":
        return "Sick Leave"
      case "off":
        return "Day Off"
      default:
        return status
    }
  }

  const addSchedule = (
    staffId: string,
    startTime: string,
    endTime: string,
    status: ScheduleEntry["status"],
    selectedServices: string[],
  ) => {
    const newSchedule: ScheduleEntry = {
      id: `s${Date.now()}`,
      staffId,
      date: new Date(date),
      startTime,
      endTime,
      status,
      services: status === "available" ? selectedServices : [],
    }

    setSchedules([...schedules, newSchedule])

    toast({
      title: "Schedule added",
      description: `Schedule for ${staff.find((s) => s.id === staffId)?.name} has been added`,
    })

    setAddScheduleOpen(false)
  }

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(schedules.filter((s) => s.id !== scheduleId))

    toast({
      title: "Schedule deleted",
      description: "The schedule entry has been removed",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-80">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
            />
            <div className="mt-4">
              <Dialog open={addScheduleOpen} onOpenChange={setAddScheduleOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Staff Schedule</DialogTitle>
                    <DialogDescription>Add a schedule for {date.toLocaleDateString()}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="staff">Staff Member</Label>
                      <Select onValueChange={setSelectedStaff}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select defaultValue="available" id="status">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start-time">Start Time</Label>
                        <Input type="time" id="start-time" defaultValue="09:00" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-time">End Time</Label>
                        <Input type="time" id="end-time" defaultValue="17:00" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Available Services</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {services.map((service, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox id={`service-${index}`} />
                            <Label htmlFor={`service-${index}`} className="text-sm">
                              {service}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddScheduleOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const statusSelect = document.getElementById("status") as HTMLSelectElement
                        const startTimeInput = document.getElementById("start-time") as HTMLInputElement
                        const endTimeInput = document.getElementById("end-time") as HTMLInputElement

                        // Get selected services
                        const selectedServices = services.filter((_, index) => {
                          const checkbox = document.getElementById(`service-${index}`) as HTMLInputElement
                          return checkbox?.checked
                        })

                        if (selectedStaff && statusSelect?.value) {
                          addSchedule(
                            selectedStaff,
                            startTimeInput.value,
                            endTimeInput.value,
                            statusSelect.value as ScheduleEntry["status"],
                            selectedServices,
                          )
                        }
                      }}
                    >
                      Add Schedule
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Staff</h3>
              <div className="space-y-2">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex-1">
          <Tabs defaultValue="day" value={viewMode} onValueChange={setViewMode}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
              <div className="text-lg font-medium">
                {date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>

            <TabsContent value="day" className="mt-0">
              <Card>
                <CardContent className="p-4">
                  {filteredSchedules.length > 0 ? (
                    <div className="space-y-4">
                      {filteredSchedules.map((schedule) => {
                        const staffMember = staff.find((s) => s.id === schedule.staffId)

                        return (
                          <div key={schedule.id} className="flex items-start space-x-4 p-3 rounded-md border">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={staffMember?.avatar || "/placeholder.svg"} alt={staffMember?.name} />
                              <AvatarFallback>{staffMember?.initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{staffMember?.name}</p>
                                <Badge variant="outline" className={getStatusColor(schedule.status)}>
                                  {getStatusText(schedule.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{staffMember?.role}</p>

                              {schedule.status === "available" && (
                                <>
                                  <div className="text-xs text-muted-foreground">
                                    <Clock className="inline-block h-3 w-3 mr-1" />
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>

                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {schedule.services.map((service, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => deleteSchedule(schedule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground mb-4">No schedules for this day</p>
                      <Button onClick={() => setAddScheduleOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Schedule
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center text-muted-foreground py-8">
                    Week view calendar would be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {schedules.map((schedule) => {
                      const staffMember = staff.find((s) => s.id === schedule.staffId)

                      return (
                        <div key={schedule.id} className="flex items-start space-x-4 p-3 rounded-md border">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={staffMember?.avatar || "/placeholder.svg"} alt={staffMember?.name} />
                            <AvatarFallback>{staffMember?.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{staffMember?.name}</p>
                              <Badge variant="outline" className={getStatusColor(schedule.status)}>
                                {getStatusText(schedule.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{staffMember?.role}</p>
                            <div className="text-xs text-muted-foreground">
                              {schedule.date.toLocaleDateString("en-GB", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </div>

                            {schedule.status === "available" && (
                              <>
                                <div className="text-xs text-muted-foreground">
                                  <Clock className="inline-block h-3 w-3 mr-1" />
                                  {schedule.startTime} - {schedule.endTime}
                                </div>

                                <div className="flex flex-wrap gap-1 mt-1">
                                  {schedule.services.map((service, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteSchedule(schedule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
