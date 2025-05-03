"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  UserCheck,
  UserX,
  MessageSquare,
  Bell,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type QueueStatus = "waiting" | "in-progress" | "completed" | "no-show";

interface QueuePatient {
  id: string;
  name: string;
  queueNumber: number;
  waitTime: number;
  status: QueueStatus;
  appointmentTime: string;
  appointmentType: string;
  nhsNumber?: string;
  checkedInFrom?: "home" | "kiosk" | "counter";
  estimatedTimeToSee?: string;
}

interface Pharmacist {
  id: string;
  name: string;
  specialty: string;
  room: string;
  avatar: string;
  initials: string;
  status: "available" | "busy" | "break" | "away";
  currentPatient: QueuePatient | null;
  queue: QueuePatient[];
}

export function PharmacistQueueSummary() {
  const { toast } = useToast();
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      specialty: "Pharmacist",
      room: "Consultation Room 1",
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
        appointmentType: "Medication Review",
        nhsNumber: "1234567890",
        checkedInFrom: "home",
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
          nhsNumber: "2345678901",
          checkedInFrom: "kiosk",
          estimatedTimeToSee: "09:25",
        },
        {
          id: "p3",
          name: "Michael Brown",
          queueNumber: 3,
          waitTime: 25,
          status: "waiting",
          appointmentTime: "09:30",
          appointmentType: "New Medicine Service",
          nhsNumber: "3456789012",
          checkedInFrom: "counter",
          estimatedTimeToSee: "09:40",
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
          nhsNumber: "4567890123",
          checkedInFrom: "home",
          estimatedTimeToSee: "09:20",
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
      currentPatient: {
        id: "p5",
        name: "David Jones",
        queueNumber: 1,
        waitTime: 0,
        status: "in-progress",
        appointmentTime: "09:00",
        appointmentType: "Diabetes Review",
        nhsNumber: "5678901234",
        checkedInFrom: "kiosk",
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
          nhsNumber: "6789012345",
          checkedInFrom: "home",
          estimatedTimeToSee: "09:25",
        },
        {
          id: "p7",
          name: "Robert Martin",
          queueNumber: 3,
          waitTime: 20,
          status: "waiting",
          appointmentTime: "09:30",
          appointmentType: "Prescription Review",
          nhsNumber: "7890123456",
          checkedInFrom: "counter",
          estimatedTimeToSee: "09:40",
        },
        {
          id: "p8",
          name: "Jennifer White",
          queueNumber: 4,
          waitTime: 35,
          status: "waiting",
          appointmentTime: "09:45",
          appointmentType: "Flu Vaccination",
          nhsNumber: "8901234567",
          checkedInFrom: "home",
          estimatedTimeToSee: "10:00",
        },
      ],
    },
  ]);

  const completeCurrentPatient = (pharmacistId: string) => {
    setPharmacists(
      pharmacists.map((pharmacist) => {
        if (pharmacist.id === pharmacistId && pharmacist.currentPatient) {
          // Move to next patient if available
          const nextPatient =
            pharmacist.queue.length > 0 ? pharmacist.queue[0] : null;
          const newQueue = pharmacist.queue.slice(1);

          return {
            ...pharmacist,
            currentPatient: nextPatient,
            status: nextPatient ? "busy" : "available",
            queue: newQueue,
          };
        }
        return pharmacist;
      })
    );

    toast({
      title: "Consultation completed",
      description: "The next patient has been called",
    });
  };

  const markNoShow = (pharmacistId: string) => {
    setPharmacists(
      pharmacists.map((pharmacist) => {
        if (pharmacist.id === pharmacistId && pharmacist.currentPatient) {
          // Move to next patient if available
          const nextPatient =
            pharmacist.queue.length > 0 ? pharmacist.queue[0] : null;
          const newQueue = pharmacist.queue.slice(1);

          return {
            ...pharmacist,
            currentPatient: nextPatient,
            status: nextPatient ? "busy" : "available",
            queue: newQueue,
          };
        }
        return pharmacist;
      })
    );

    toast({
      title: "Patient marked as no-show",
      description: "The next patient has been called",
      variant: "destructive",
    });
  };

  const callNextPatient = (pharmacistId: string) => {
    setPharmacists(
      pharmacists.map((pharmacist) => {
        if (
          pharmacist.id === pharmacistId &&
          pharmacist.queue.length > 0 &&
          !pharmacist.currentPatient
        ) {
          const nextPatient = pharmacist.queue[0];
          const newQueue = pharmacist.queue.slice(1);

          return {
            ...pharmacist,
            currentPatient: nextPatient,
            status: "busy",
            queue: newQueue,
          };
        }
        return pharmacist;
      })
    );

    toast({
      title: "Next patient called",
      description: "Patient has been notified via SMS",
    });
  };

  const sendReminder = (patientId: string) => {
    toast({
      title: "Reminder sent",
      description: "SMS reminder sent to patient",
    });
  };

  const movePatientInQueue = (
    pharmacistId: string,
    patientId: string,
    direction: "up" | "down"
  ) => {
    setPharmacists(
      pharmacists.map((pharmacist) => {
        if (pharmacist.id === pharmacistId) {
          const queueCopy = [...pharmacist.queue];
          const patientIndex = queueCopy.findIndex((p) => p.id === patientId);

          if (patientIndex === -1) return pharmacist;

          if (direction === "up" && patientIndex > 0) {
            // Swap with previous patient
            [queueCopy[patientIndex], queueCopy[patientIndex - 1]] = [
              queueCopy[patientIndex - 1],
              queueCopy[patientIndex],
            ];

            // Update queue numbers
            queueCopy[patientIndex].queueNumber = patientIndex + 1;
            queueCopy[patientIndex - 1].queueNumber = patientIndex;
          } else if (
            direction === "down" &&
            patientIndex < queueCopy.length - 1
          ) {
            // Swap with next patient
            [queueCopy[patientIndex], queueCopy[patientIndex + 1]] = [
              queueCopy[patientIndex + 1],
              queueCopy[patientIndex],
            ];

            // Update queue numbers
            queueCopy[patientIndex].queueNumber = patientIndex + 1;
            queueCopy[patientIndex + 1].queueNumber = patientIndex + 2;
          }

          return {
            ...pharmacist,
            queue: queueCopy,
          };
        }
        return pharmacist;
      })
    );

    toast({
      title: `Patient moved ${direction} in queue`,
      description: `Queue position updated and patient notified`,
    });
  };

  const getStatusColor = (status: Pharmacist["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-amber-500";
      case "break":
        return "bg-blue-500";
      case "away":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCheckedInBadge = (method?: "home" | "kiosk" | "counter") => {
    switch (method) {
      case "home":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Home Check-in
          </Badge>
        );
      case "kiosk":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Kiosk Check-in
          </Badge>
        );
      case "counter":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Counter Check-in
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {pharmacists.map((pharmacist) => (
        <Card key={pharmacist.id} className="overflow-hidden">
          <div className="bg-muted/30 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={pharmacist.avatar || "/placeholder.svg"}
                    alt={pharmacist.name}
                  />
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
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                    pharmacist.status
                  )}`}
                />
                <span className="text-sm capitalize">{pharmacist.status}</span>
              </div>
            </div>
          </div>

          <CardContent className="p-4 pt-5">
            <div className="space-y-4">
              {pharmacist.currentPatient ? (
                <div className="rounded-md bg-muted p-4">
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between">
                    {/* Patient info section */}
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="text-lg h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                      >
                        {pharmacist.currentPatient.queueNumber}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {pharmacist.currentPatient.name}
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                          <span>
                            Appointment:{" "}
                            {pharmacist.currentPatient.appointmentTime}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>
                            {pharmacist.currentPatient.appointmentType}
                          </span>
                          {pharmacist.currentPatient.nhsNumber && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>
                                NHS: {pharmacist.currentPatient.nhsNumber}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badges and action buttons section */}
                    <div className="flex flex-col xs:flex-row gap-2">
                      {/* Check-in badge */}
                      <div className="self-start xs:self-center mb-2 xs:mb-0">
                        {getCheckedInBadge(
                          pharmacist.currentPatient.checkedInFrom
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => completeCurrentPatient(pharmacist.id)}
                        >
                          <UserCheck className="mr-1 h-4 w-4" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markNoShow(pharmacist.id)}
                        >
                          <UserX className="mr-1 h-4 w-4" />
                          No-show
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span>In progress</span>
                      <span>~15 min consultation</span>
                    </div>
                    <Progress value={33} className="h-2 mt-1" />
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-muted p-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    No active patient
                  </p>
                  {pharmacist.queue.length > 0 ? (
                    <Button
                      size="sm"
                      onClick={() => callNextPatient(pharmacist.id)}
                    >
                      Call Next Patient
                    </Button>
                  ) : (
                    <Badge variant="outline">Queue Empty</Badge>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Waiting ({pharmacist.queue.length})
                  </h4>
                  <Button variant="ghost" size="sm" className="h-7 gap-1">
                    View All <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {pharmacist.queue.length > 0 ? (
                  <div className="space-y-2">
                    {pharmacist.queue.slice(0, 3).map((patient, index) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        {/* Left section with queue number and patient info */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge
                            variant="outline"
                            className="h-8 w-8 rounded-full flex items-center justify-center"
                          >
                            {patient.queueNumber}
                          </Badge>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {patient.appointmentType}
                            </div>
                          </div>
                        </div>

                        {/* Appointment time and ETA - reduced gap */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            {patient.appointmentTime}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-medium">
                            ETA: {patient.estimatedTimeToSee}
                          </span>
                        </div>

                        {/* Right section with badges and actions */}
                        <div className="flex flex-col gap-2 min-w-fit">
                          {/* Badges row with proper wrapping */}
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {/* Wait time badge */}
                            <Badge
                              variant={
                                patient.waitTime > 15
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="whitespace-nowrap px-3 py-1"
                            >
                              {patient.waitTime} min wait
                            </Badge>

                            {/* Check-in badge */}
                            <div className="flex-shrink-0">
                              {getCheckedInBadge(patient.checkedInFrom)}
                            </div>
                          </div>

                          {/* Action buttons - below badges with flex-end */}
                          <div className="flex items-center justify-end">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => sendReminder(patient.id)}
                                  >
                                    <Bell className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send reminder</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Message patient</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      movePatientInQueue(
                                        pharmacist.id,
                                        patient.id,
                                        "up"
                                      )
                                    }
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Move up in queue
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() =>
                                      movePatientInQueue(
                                        pharmacist.id,
                                        patient.id,
                                        "down"
                                      )
                                    }
                                    disabled={
                                      index === pharmacist.queue.length - 1
                                    }
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Move down in queue
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pharmacist.queue.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        +{pharmacist.queue.length - 3} more patients in queue
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
