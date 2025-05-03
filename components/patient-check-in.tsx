"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { QrCode, Clock, MapPin, CheckCircle2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface CheckInPatient {
  id: string
  name: string
  nhsNumber: string
  appointmentTime: string
  appointmentType: string
  pharmacistName: string
  room: string
  status: "pending" | "checked-in" | "in-progress" | "completed" | "no-show"
  checkInMethod?: "home" | "kiosk" | "counter"
  preVisitCompleted?: boolean
  symptoms?: string[]
  allergies?: string[]
  documents?: string[]
  estimatedTimeToSee?: string
  location?: {
    latitude: number
    longitude: number
    lastUpdated: string
    eta: string
  }
}

export function PatientCheckIn() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("counter")
  const [nhsNumber, setNhsNumber] = useState("")
  const [qrCode, setQrCode] = useState("")

  const [patients, setPatients] = useState<CheckInPatient[]>([
    {
      id: "p1",
      name: "John Smith",
      nhsNumber: "1234567890",
      appointmentTime: "09:00",
      appointmentType: "Medication Review",
      pharmacistName: "Sarah Johnson",
      room: "Consultation Room 1",
      status: "in-progress",
      checkInMethod: "home",
      preVisitCompleted: true,
      symptoms: ["Headache", "Dizziness"],
      allergies: ["Penicillin"],
      documents: ["Prescription.pdf"],
      estimatedTimeToSee: "In progress",
    },
    {
      id: "p2",
      name: "Emma Wilson",
      nhsNumber: "2345678901",
      appointmentTime: "09:15",
      appointmentType: "Flu Vaccination",
      pharmacistName: "Sarah Johnson",
      room: "Consultation Room 1",
      status: "checked-in",
      checkInMethod: "kiosk",
      preVisitCompleted: true,
      symptoms: [],
      allergies: ["None"],
      estimatedTimeToSee: "09:25",
    },
    {
      id: "p3",
      name: "Michael Brown",
      nhsNumber: "3456789012",
      appointmentTime: "09:30",
      appointmentType: "New Medicine Service",
      pharmacistName: "Sarah Johnson",
      room: "Consultation Room 1",
      status: "pending",
      location: {
        latitude: 55.953251,
        longitude: -3.188267,
        lastUpdated: "09:05",
        eta: "5 minutes",
      },
      estimatedTimeToSee: "09:40",
    },
    {
      id: "p4",
      name: "Sophie Taylor",
      nhsNumber: "4567890123",
      appointmentTime: "09:15",
      appointmentType: "Blood Pressure Check",
      pharmacistName: "James Williams",
      room: "Consultation Room 2",
      status: "pending",
      estimatedTimeToSee: "09:20",
    },
  ])

  const handleCheckIn = (method: "counter" | "kiosk" | "qr") => {
    let patientId = ""

    if (method === "counter" || method === "kiosk") {
      // Find patient by NHS number
      const patient = patients.find((p) => p.nhsNumber === nhsNumber && p.status === "pending")
      patientId = patient?.id || ""
    } else if (method === "qr") {
      // In a real app, we would decode the QR code to get the patient ID
      // For this demo, we'll just assume the QR code is the patient ID
      patientId = qrCode
    }

    if (!patientId) {
      toast({
        title: "Patient not found",
        description: "No pending appointment found for this patient",
        variant: "destructive",
      })
      return
    }

    // Update patient status
    setPatients(
      patients.map((p) =>
        p.id === patientId ? { ...p, status: "checked-in", checkInMethod: method === "qr" ? "home" : method } : p,
      ),
    )

    toast({
      title: "Check-in successful",
      description: `Patient has been checked in via ${method === "qr" ? "QR code" : method}`,
    })

    // Reset form
    setNhsNumber("")
    setQrCode("")
  }

  const generateHomeCheckInLink = (patientId: string) => {
    // In a real app, this would generate a unique link with a token
    const baseUrl = window.location.origin
    return `${baseUrl}/check-in/${patientId}`
  }

  const sendHomeCheckInLink = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    if (!patient) return

    const link = generateHomeCheckInLink(patientId)

    toast({
      title: "Check-in link sent",
      description: `SMS with check-in link sent to ${patient.name}`,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="counter" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="counter">Counter Check-in</TabsTrigger>
          <TabsTrigger value="kiosk">Kiosk Mode</TabsTrigger>
          <TabsTrigger value="home">Home Check-in</TabsTrigger>
        </TabsList>

        <TabsContent value="counter" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nhs-number">NHS Number or Appointment Reference</Label>
                  <div className="flex gap-2">
                    <Input
                      id="nhs-number"
                      placeholder="Enter NHS number"
                      value={nhsNumber}
                      onChange={(e) => setNhsNumber(e.target.value)}
                    />
                    <Button onClick={() => handleCheckIn("counter")} disabled={!nhsNumber}>
                      Check In
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Or Scan QR Code</Label>
                  <Button variant="outline" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Today's Appointments</h3>
            <div className="space-y-2">
              {patients
                .filter((p) => p.status === "pending")
                .map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {patient.appointmentTime} - {patient.appointmentType}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setNhsNumber(patient.nhsNumber)
                          handleCheckIn("counter")
                        }}
                      >
                        Check In
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => sendHomeCheckInLink(patient.id)}>
                        Send Link
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kiosk" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-6 py-8">
                <h2 className="text-2xl font-bold">Welcome to North Road Pharmacy</h2>
                <p className="text-muted-foreground">Please enter your NHS number to check in</p>

                <div className="max-w-md mx-auto space-y-4">
                  <Input
                    placeholder="Enter your NHS number"
                    className="text-lg h-12 text-center"
                    value={nhsNumber}
                    onChange={(e) => setNhsNumber(e.target.value)}
                  />

                  <Button size="lg" className="w-full" onClick={() => handleCheckIn("kiosk")} disabled={!nhsNumber}>
                    Check In
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-8">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-muted-foreground">or</span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="home" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="qr-code">QR Code or Check-in Reference</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qr-code"
                      placeholder="Enter check-in code"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                    />
                    <Button onClick={() => handleCheckIn("qr")} disabled={!qrCode}>
                      Verify
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Pre-visit Information</h3>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="symptoms">Symptoms (if any)</Label>
                      <Textarea id="symptoms" placeholder="Please describe any symptoms you're experiencing" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea id="allergies" placeholder="Please list any allergies" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="medications">Current Medications</Label>
                      <Textarea id="medications" placeholder="Please list any medications you're currently taking" />
                    </div>

                    <div className="grid gap-2">
                      <Label>Upload Documents (if needed)</Label>
                      <div className="border border-dashed rounded-md p-4 text-center">
                        <p className="text-sm text-muted-foreground">Drag and drop files here or click to browse</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="share-location" />
                      <Label htmlFor="share-location">Share my location for ETA updates</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Checked-in Patients</h3>
        <div className="space-y-3">
          {patients
            .filter((p) => p.status === "checked-in" || p.status === "in-progress")
            .map((patient) => (
              <Card key={patient.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {patient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{patient.name}</div>
                        <Badge variant={patient.status === "in-progress" ? "default" : "secondary"}>
                          {patient.status === "in-progress" ? "In Progress" : "Checked In"}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground mt-1">NHS: {patient.nhsNumber}</div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>
                            {patient.appointmentTime} - {patient.appointmentType}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{patient.room}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          {patient.status === "in-progress" ? (
                            <CheckCircle2 className="h-4 w-4 mr-1 text-primary" />
                          ) : (
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          )}
                          <span>
                            {patient.status === "in-progress"
                              ? "Currently with " + patient.pharmacistName
                              : "ETA: " + patient.estimatedTimeToSee}
                          </span>
                        </div>
                      </div>

                      {patient.status === "in-progress" && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>In progress</span>
                            <span>~15 min consultation</span>
                          </div>
                          <Progress value={33} className="h-2 mt-1" />
                        </div>
                      )}

                      {patient.preVisitCompleted && (
                        <div className="mt-3">
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span>Pre-visit information completed</span>
                          </div>

                          {(patient.symptoms?.length > 0 || patient.allergies?.length > 0) && (
                            <div className="mt-2 space-y-1">
                              {patient.symptoms?.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium">Symptoms:</span> {patient.symptoms.join(", ")}
                                </div>
                              )}
                              {patient.allergies?.length > 0 && (
                                <div className="text-xs">
                                  <span className="font-medium">Allergies:</span> {patient.allergies.join(", ")}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {patient.location && (
                        <div className="mt-3">
                          <div className="flex items-center text-sm text-blue-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>Location shared • ETA: {patient.location.eta}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {patient.status === "checked-in" && (
                        <>
                          <Button size="sm">Start Consultation</Button>
                          <Button size="sm" variant="outline">
                            Send Message
                          </Button>
                        </>
                      )}
                      {patient.status === "in-progress" && (
                        <Button size="sm" variant="outline">
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

          {patients.filter((p) => p.status === "checked-in" || p.status === "in-progress").length === 0 && (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              No patients currently checked in
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
