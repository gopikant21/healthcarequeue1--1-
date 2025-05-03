"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  DotIcon as DragHandleDots2Icon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  Bell,
  UserCheck,
  UserX,
  MessageSquare,
  MoreHorizontal,
  CalendarIcon,
  UserCog,
  FileText,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  addDays,
  isSameDay,
  startOfWeek,
  addWeeks,
  subWeeks,
  isWithinInterval,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns";

type AppointmentStatus =
  | "scheduled"
  | "checked-in"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  pharmacistId: string;
  pharmacistName: string;
  date: Date;
  time: string;
  endTime: string;
  duration: number; // in minutes
  room: string;
  status: AppointmentStatus;
  appointmentType: string;
  nhsNumber?: string;
  notes?: string;
  accessibility?: string[];
  color?: string;
  checkInMethod?: "counter" | "kiosk" | "online" | "sms";
  waitingTime?: number; // in minutes
  priority?: "normal" | "urgent" | "follow-up";
  contactNumber?: string;
  email?: string;
  history?: AppointmentHistory[];
}

interface AppointmentHistory {
  id: string;
  date: Date;
  type: string;
  notes: string;
  pharmacistName: string;
}

interface Pharmacist {
  id: string;
  name: string;
  specialty: string;
  color: string;
  availability: {
    start: string;
    end: string;
    days: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
  avatar?: string;
  status?: "available" | "busy" | "break" | "away";
}

interface CheckInSettings {
  kioskEnabled: boolean;
  onlineEnabled: boolean;
  smsEnabled: boolean;
  kioskHours: {
    start: string;
    end: string;
  };
  requireNHS: boolean;
  allowWalkIn: boolean;
  sendReminders: boolean;
  reminderTime: number; // hours before appointment
}

interface WaitlistItem {
  id: string;
  patientName: string;
  patientId: string;
  nhsNumber?: string;
  reason: string;
  priority: "normal" | "urgent" | "follow-up";
  arrivalTime: string;
  estimatedWait: number;
  status: "waiting" | "called" | "completed" | "cancelled";
  notes?: string;
  contactNumber?: string;
}

interface AppointmentCalendarProps {
  initialView?: "day" | "week" | "queue" | "pharmacist" | "list";
}

export function AppointmentCalendar({
  initialView = "day",
}: AppointmentCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState<string | null>(
    null
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [viewMode, setViewMode] = useState<string>(initialView);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [draggedAppointment, setDraggedAppointment] =
    useState<Appointment | null>(null);
  const [dragOverTime, setDragOverTime] = useState<string | null>(null);
  const [dragOverPharmacist, setDragOverPharmacist] = useState<string | null>(
    null
  );
  const [showAllPharmacists, setShowAllPharmacists] = useState(true);
  const [filteredPharmacistId, setFilteredPharmacistId] = useState<
    string | null
  >(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [showFilters, setShowFilters] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [checkInSettingsOpen, setCheckInSettingsOpen] = useState(false);
  const [waitlistManagementOpen, setWaitlistManagementOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarView, setCalendarView] = useState<"month" | "agenda">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const timeSlotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const dayViewRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false);
  const [sendSmsDialogOpen, setSendSmsDialogOpen] = useState(false);
  const [patientHistoryOpen, setPatientHistoryOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const [checkInSettings, setCheckInSettings] = useState<CheckInSettings>({
    kioskEnabled: true,
    onlineEnabled: true,
    smsEnabled: true,
    kioskHours: {
      start: "08:00",
      end: "18:00",
    },
    requireNHS: true,
    allowWalkIn: true,
    sendReminders: true,
    reminderTime: 24,
  });

  const pharmacists: Pharmacist[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      specialty: "Clinical Pharmacist",
      color: "bg-blue-500",
      availability: {
        start: "09:00",
        end: "17:30",
        days: [1, 2, 3, 4, 5], // Monday to Friday
      },
      avatar: "/placeholder.svg?height=40&width=40",
      status: "busy",
    },
    {
      id: "2",
      name: "James Williams",
      specialty: "Pharmacy Manager",
      color: "bg-green-500",
      availability: {
        start: "08:30",
        end: "18:00",
        days: [1, 2, 3, 4, 5], // Monday to Friday
      },
      avatar: "/placeholder.svg?height=40&width=40",
      status: "available",
    },
    {
      id: "3",
      name: "Emily Chen",
      specialty: "Pharmacist",
      color: "bg-purple-500",
      availability: {
        start: "09:00",
        end: "17:00",
        days: [1, 2, 3, 4, 5], // Monday to Friday
      },
      avatar: "/placeholder.svg?height=40&width=40",
      status: "busy",
    },
    {
      id: "4",
      name: "Michael Roberts",
      specialty: "Clinical Pharmacist",
      color: "bg-amber-500",
      availability: {
        start: "08:00",
        end: "16:00",
        days: [1, 2, 3, 4, 5], // Monday to Friday
      },
      avatar: "/placeholder.svg?height=40&width=40",
      status: "break",
    },
    {
      id: "5",
      name: "Lisa Thompson",
      specialty: "Pharmacy Technician",
      color: "bg-pink-500",
      availability: {
        start: "10:00",
        end: "18:00",
        days: [1, 2, 3, 4, 5], // Monday to Friday
      },
      avatar: "/placeholder.svg?height=40&width=40",
      status: "away",
    },
  ];

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      patientId: "p1",
      patientName: "John Smith",
      pharmacistId: "1",
      pharmacistName: "Sarah Johnson",
      date: new Date(),
      time: "09:00",
      endTime: "09:15",
      duration: 15,
      room: "Consultation Room 1",
      status: "in-progress",
      appointmentType: "Medication Review",
      nhsNumber: "123 456 7890",
      color: "bg-blue-500",
      checkInMethod: "counter",
      waitingTime: 0,
      contactNumber: "07700 900123",
      email: "john.smith@example.com",
      history: [
        {
          id: "h1",
          date: new Date(2025, 4, 1),
          type: "Medication Review",
          notes:
            "Patient reported side effects from new medication. Advised to reduce dosage.",
          pharmacistName: "Sarah Johnson",
        },
        {
          id: "h2",
          date: new Date(2025, 3, 15),
          type: "Blood Pressure Check",
          notes:
            "Blood pressure slightly elevated at 140/90. Recommended lifestyle changes.",
          pharmacistName: "James Williams",
        },
      ],
    },
    {
      id: "2",
      patientId: "p2",
      patientName: "Emma Wilson",
      pharmacistId: "1",
      pharmacistName: "Sarah Johnson",
      date: new Date(),
      time: "09:15",
      endTime: "09:30",
      duration: 15,
      room: "Consultation Room 1",
      status: "checked-in",
      appointmentType: "Flu Vaccination",
      nhsNumber: "234 567 8901",
      color: "bg-blue-500",
      checkInMethod: "kiosk",
      waitingTime: 5,
      contactNumber: "07700 900124",
      email: "emma.wilson@example.com",
      history: [
        {
          id: "h3",
          date: new Date(2025, 2, 20),
          type: "Flu Vaccination",
          notes: "Previous vaccination completed with no adverse reactions.",
          pharmacistName: "Sarah Johnson",
        },
      ],
    },
    {
      id: "3",
      patientId: "p3",
      patientName: "Michael Brown",
      pharmacistId: "1",
      pharmacistName: "Sarah Johnson",
      date: new Date(),
      time: "09:30",
      endTime: "09:45",
      duration: 15,
      room: "Consultation Room 1",
      status: "scheduled",
      appointmentType: "Prescription Consultation",
      nhsNumber: "345 678 9012",
      color: "bg-blue-500",
      contactNumber: "07700 900125",
      email: "michael.brown@example.com",
    },
    {
      id: "4",
      patientId: "p4",
      patientName: "Sophie Taylor",
      pharmacistId: "2",
      pharmacistName: "James Williams",
      date: new Date(),
      time: "09:15",
      endTime: "09:45",
      duration: 30,
      room: "Consultation Room 2",
      status: "scheduled",
      appointmentType: "Blood Pressure Check",
      nhsNumber: "456 789 0123",
      color: "bg-green-500",
      contactNumber: "07700 900126",
      email: "sophie.taylor@example.com",
      history: [
        {
          id: "h4",
          date: new Date(2025, 3, 5),
          type: "Blood Pressure Check",
          notes: "Blood pressure normal at 120/80.",
          pharmacistName: "James Williams",
        },
      ],
    },
    {
      id: "5",
      patientId: "p5",
      patientName: "David Jones",
      pharmacistId: "3",
      pharmacistName: "Emily Chen",
      date: new Date(),
      time: "09:00",
      endTime: "09:15",
      duration: 15,
      room: "Consultation Room 3",
      status: "in-progress",
      appointmentType: "Diabetes Review",
      nhsNumber: "567 890 1234",
      color: "bg-purple-500",
      checkInMethod: "online",
      waitingTime: 0,
      contactNumber: "07700 900127",
      email: "david.jones@example.com",
    },
    {
      id: "6",
      patientId: "p6",
      patientName: "Lisa Anderson",
      pharmacistId: "3",
      pharmacistName: "Emily Chen",
      date: new Date(),
      time: "09:15",
      endTime: "09:30",
      duration: 15,
      room: "Consultation Room 3",
      status: "checked-in",
      appointmentType: "New Medication Consultation",
      nhsNumber: "678 901 2345",
      color: "bg-purple-500",
      checkInMethod: "sms",
      waitingTime: 10,
      contactNumber: "07700 900128",
      email: "lisa.anderson@example.com",
    },
    {
      id: "7",
      patientId: "p7",
      patientName: "Robert Martin",
      pharmacistId: "4",
      pharmacistName: "Michael Roberts",
      date: addDays(new Date(), 1),
      time: "10:00",
      endTime: "10:15",
      duration: 15,
      room: "Consultation Room 1",
      status: "scheduled",
      appointmentType: "Smoking Cessation",
      nhsNumber: "789 012 3456",
      color: "bg-amber-500",
      contactNumber: "07700 900129",
      email: "robert.martin@example.com",
    },
    {
      id: "8",
      patientId: "p8",
      patientName: "Jennifer White",
      pharmacistId: "5",
      pharmacistName: "Lisa Thompson",
      date: addDays(new Date(), 1),
      time: "11:00",
      endTime: "11:30",
      duration: 30,
      room: "Consultation Room 2",
      status: "scheduled",
      appointmentType: "Travel Health Consultation",
      nhsNumber: "890 123 4567",
      color: "bg-pink-500",
      contactNumber: "07700 900130",
      email: "jennifer.white@example.com",
    },
  ]);

  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([
    {
      id: "w1",
      patientName: "Thomas Wilson",
      patientId: "p10",
      nhsNumber: "901 234 5678",
      reason: "Prescription Query",
      priority: "normal",
      arrivalTime: "08:45",
      estimatedWait: 25,
      status: "waiting",
      notes: "Needs to speak to pharmacist about dosage",
      contactNumber: "07700 900131",
    },
    {
      id: "w2",
      patientName: "Olivia Johnson",
      patientId: "p11",
      nhsNumber: "012 345 6789",
      reason: "Blood Pressure Check",
      priority: "urgent",
      arrivalTime: "08:50",
      estimatedWait: 10,
      status: "waiting",
      notes: "Patient reported very high BP this morning",
      contactNumber: "07700 900132",
    },
    {
      id: "w3",
      patientName: "William Davis",
      patientId: "p12",
      nhsNumber: "123 456 7890",
      reason: "Medication Review",
      priority: "normal",
      arrivalTime: "09:05",
      estimatedWait: 35,
      status: "waiting",
      notes: "",
      contactNumber: "07700 900133",
    },
  ]);

  const timeSlots = [
    "08:00",
    "08:15",
    "08:30",
    "08:45",
    "09:00",
    "09:15",
    "09:30",
    "09:45",
    "10:00",
    "10:15",
    "10:30",
    "10:45",
    "11:00",
    "11:15",
    "11:30",
    "11:45",
    "12:00",
    "12:15",
    "12:30",
    "12:45",
    "13:00",
    "13:15",
    "13:30",
    "13:45",
    "14:00",
    "14:15",
    "14:30",
    "14:45",
    "15:00",
    "15:15",
    "15:30",
    "15:45",
    "16:00",
    "16:15",
    "16:30",
    "16:45",
    "17:00",
    "17:15",
    "17:30",
    "17:45",
    "18:00",
    "18:15",
    "18:30",
    "18:45",
  ];

  const serviceTypes = [
    {
      id: "medication-review",
      name: "Medication Review",
      duration: 15,
      color: "bg-blue-100",
    },
    {
      id: "flu-vaccination",
      name: "Flu Vaccination",
      duration: 15,
      color: "bg-green-100",
    },
    {
      id: "blood-pressure",
      name: "Blood Pressure Check",
      duration: 15,
      color: "bg-purple-100",
    },
    {
      id: "diabetes-review",
      name: "Diabetes Review",
      duration: 30,
      color: "bg-amber-100",
    },
    {
      id: "new-prescription",
      name: "New Prescription Consultation",
      duration: 15,
      color: "bg-pink-100",
    },
    {
      id: "smoking-cessation",
      name: "Smoking Cessation",
      duration: 30,
      color: "bg-indigo-100",
    },
    {
      id: "travel-health",
      name: "Travel Health Consultation",
      duration: 30,
      color: "bg-teal-100",
    },
    {
      id: "nms",
      name: "New Medicine Service",
      duration: 15,
      color: "bg-cyan-100",
    },
    {
      id: "mur",
      name: "Medicines Use Review",
      duration: 20,
      color: "bg-orange-100",
    },
  ];

  // Update wait times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setAppointments((prevAppointments) => {
        return prevAppointments.map((appointment) => {
          if (
            appointment.status === "checked-in" &&
            appointment.waitingTime !== undefined
          ) {
            return {
              ...appointment,
              waitingTime: appointment.waitingTime + 1,
            };
          }
          return appointment;
        });
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Filter appointments based on selected date, pharmacist, service type, and status
  const filteredAppointments = appointments.filter((appointment) => {
    // Search query filter
    if (
      searchQuery &&
      !appointment.patientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !appointment.nhsNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !appointment.appointmentType
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !appointment.contactNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      !appointment.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Date filter from filter dialog
    if (dateFilter && !isSameDay(appointment.date, dateFilter)) return false;

    // Date filter
    if (viewMode === "day" && !isSameDay(appointment.date, date)) return false;

    // Week view filter
    if (viewMode === "week") {
      const endOfWeek = addDays(weekStartDate, 6);
      if (
        !isWithinInterval(appointment.date, {
          start: weekStartDate,
          end: endOfWeek,
        })
      )
        return false;
    }

    // Queue view filter - only show today's checked-in and in-progress appointments
    if (viewMode === "queue") {
      if (!isSameDay(appointment.date, new Date())) return false;
      if (
        appointment.status !== "checked-in" &&
        appointment.status !== "in-progress"
      )
        return false;
    }

    // Month view filter
    if (
      calendarView === "month" &&
      !isSameMonth(appointment.date, currentMonth)
    )
      return false;

    // Pharmacist filter
    if (
      filteredPharmacistId &&
      !showAllPharmacists &&
      appointment.pharmacistId !== filteredPharmacistId
    )
      return false;

    // Service type filter
    if (serviceFilter && appointment.appointmentType !== serviceFilter)
      return false;

    // Status filter
    if (statusFilter && appointment.status !== statusFilter) return false;

    return true;
  });

  // Get today's appointments for queue view
  const todaysAppointments = appointments.filter((appointment) =>
    isSameDay(appointment.date, new Date())
  );

  // Get checked-in patients for queue view
  const queuedAppointments = todaysAppointments
    .filter(
      (appointment) =>
        appointment.status === "checked-in" ||
        appointment.status === "in-progress"
    )
    .sort((a, b) => {
      // Sort by status first (in-progress first)
      if (a.status === "in-progress" && b.status !== "in-progress") return -1;
      if (a.status !== "in-progress" && b.status === "in-progress") return 1;

      // Then by waiting time (longer wait first)
      if (a.waitingTime !== undefined && b.waitingTime !== undefined) {
        return b.waitingTime - a.waitingTime;
      }
      return 0;
    });

  // Get scheduled appointments for today that haven't been checked in yet
  const scheduledTodayAppointments = todaysAppointments
    .filter((appointment) => appointment.status === "scheduled")
    .sort((a, b) => a.time.localeCompare(b.time));

  // Get appointments by pharmacist
  const appointmentsByPharmacist = pharmacists.map((pharmacist) => {
    return {
      ...pharmacist,
      appointments: appointments
        .filter(
          (appointment) =>
            appointment.pharmacistId === pharmacist.id &&
            isSameDay(appointment.date, date)
        )
        .sort((a, b) => a.time.localeCompare(b.time)),
      currentPatient:
        appointments.find(
          (appointment) =>
            appointment.pharmacistId === pharmacist.id &&
            isSameDay(appointment.date, new Date()) &&
            appointment.status === "in-progress"
        ) || null,
      waitingPatients: appointments
        .filter(
          (appointment) =>
            appointment.pharmacistId === pharmacist.id &&
            isSameDay(appointment.date, new Date()) &&
            appointment.status === "checked-in"
        )
        .sort((a, b) => {
          if (a.waitingTime !== undefined && b.waitingTime !== undefined) {
            return b.waitingTime - a.waitingTime;
          }
          return 0;
        }),
    };
  });

  // Get visible pharmacists based on filter
  const visiblePharmacists = showAllPharmacists
    ? pharmacists
    : pharmacists.filter((p) => p.id === filteredPharmacistId);

  // Get days for week view
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(weekStartDate, i)
  );

  // Navigate to next/previous week
  const goToNextWeek = () => setWeekStartDate(addWeeks(weekStartDate, 1));
  const goToPrevWeek = () => setWeekStartDate(subWeeks(weekStartDate, 1));

  // Navigate to next/previous month
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Scroll to current time on initial load
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Round to nearest 15 minutes
    const roundedMinutes = Math.floor(currentMinute / 15) * 15;
    const timeToScrollTo = `${currentHour
      .toString()
      .padStart(2, "0")}:${roundedMinutes.toString().padStart(2, "0")}`;

    // Scroll to current time with a slight offset to show context
    if (timeSlotRefs.current[timeToScrollTo] && dayViewRef.current) {
      const scrollPosition =
        timeSlotRefs.current[timeToScrollTo].offsetTop - 100;
      dayViewRef.current.scrollTo({
        top: scrollPosition > 0 ? scrollPosition : 0,
        behavior: "smooth",
      });
    }
  }, [viewMode]);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            Scheduled
          </Badge>
        );
      case "checked-in":
        return (
          <Badge variant="secondary" className="whitespace-nowrap">
            Checked In
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="default" className="whitespace-nowrap">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="success"
            className="whitespace-nowrap bg-green-100 text-green-800 hover:bg-green-200"
          >
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="whitespace-nowrap">
            Cancelled
          </Badge>
        );
      case "no-show":
        return (
          <Badge variant="destructive" className="whitespace-nowrap">
            No Show
          </Badge>
        );
    }
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

  const getCheckInMethodBadge = (method?: string) => {
    if (!method) return null;

    switch (method) {
      case "counter":
        return (
          <Badge variant="outline" className="whitespace-nowrap bg-slate-100">
            Counter
          </Badge>
        );
      case "kiosk":
        return (
          <Badge
            variant="outline"
            className="whitespace-nowrap bg-blue-50 text-blue-700"
          >
            Kiosk
          </Badge>
        );
      case "online":
        return (
          <Badge
            variant="outline"
            className="whitespace-nowrap bg-green-50 text-green-700"
          >
            Online
          </Badge>
        );
      case "sms":
        return (
          <Badge
            variant="outline"
            className="whitespace-nowrap bg-purple-50 text-purple-700"
          >
            SMS
          </Badge>
        );
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const endHours = endDate.getHours().toString().padStart(2, "0");
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0");

    return `${endHours}:${endMinutes}`;
  };

  const addAppointment = () => {
    if (!selectedPharmacist || !selectedTime || !selectedService) return;

    const patientNameInput = document.getElementById(
      "patient"
    ) as HTMLInputElement;
    const nhsInput = document.getElementById("nhs") as HTMLInputElement;
    const notesInput = document.getElementById("notes") as HTMLTextAreaElement;
    const contactNumberInput = document.getElementById(
      "contactNumber"
    ) as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;

    if (!patientNameInput?.value) {
      toast.error("Missing information", {
        description: "Please enter a patient name",
      });
      return;
    }

    const pharmacist = pharmacists.find((p) => p.id === selectedPharmacist);
    const service = serviceTypes.find((s) => s.id === selectedService);

    if (!pharmacist || !service) return;

    const endTime = calculateEndTime(selectedTime, selectedDuration);

    const newAppointment: Appointment = {
      id: `app-${Date.now()}`,
      patientId: `pat-${Date.now()}`,
      patientName: patientNameInput.value,
      pharmacistId: selectedPharmacist,
      pharmacistName: pharmacist.name,
      date: new Date(date),
      time: selectedTime,
      endTime: endTime,
      duration: selectedDuration,
      room: `Consultation Room ${Math.floor(Math.random() * 3) + 1}`,
      status: "scheduled",
      appointmentType: service.name,
      nhsNumber: nhsInput?.value || undefined,
      notes: notesInput?.value || undefined,
      color: pharmacist.color,
      contactNumber: contactNumberInput?.value || undefined,
      email: emailInput?.value || undefined,
    };

    setAppointments([...appointments, newAppointment]);

    toast.success("Appointment scheduled", {
      description: `Appointment for ${patientNameInput.value} with ${pharmacist.name} at ${selectedTime}`,
    });

    setAddAppointmentOpen(false);

    // Reset form values
    setSelectedPharmacist(null);
    setSelectedTime(null);
    setSelectedService(null);
    setSelectedDuration(15);
  };

  const updateAppointment = () => {
    if (!selectedAppointment) return;

    const patientNameInput = document.getElementById(
      "edit-patient"
    ) as HTMLInputElement;
    const nhsInput = document.getElementById("edit-nhs") as HTMLInputElement;
    const notesInput = document.getElementById(
      "edit-notes"
    ) as HTMLTextAreaElement;
    const timeInput = document.getElementById("edit-time") as HTMLInputElement;
    const pharmacistSelect = document.getElementById(
      "edit-pharmacist"
    ) as HTMLSelectElement;
    const serviceSelect = document.getElementById(
      "edit-service"
    ) as HTMLSelectElement;
    const durationSelect = document.getElementById(
      "edit-duration"
    ) as HTMLSelectElement;
    const contactNumberInput = document.getElementById(
      "edit-contactNumber"
    ) as HTMLInputElement;
    const emailInput = document.getElementById(
      "edit-email"
    ) as HTMLInputElement;

    if (!patientNameInput?.value) {
      toast.error("Missing information", {
        description: "Please enter a patient name",
      });
      return;
    }

    const pharmacist = pharmacists.find((p) => p.id === pharmacistSelect.value);
    if (!pharmacist) return;

    const endTime = calculateEndTime(
      timeInput.value,
      Number.parseInt(durationSelect.value)
    );

    const updatedAppointments = appointments.map((appointment) => {
      if (appointment.id === selectedAppointment.id) {
        return {
          ...appointment,
          patientName: patientNameInput.value,
          pharmacistId: pharmacistSelect.value,
          pharmacistName: pharmacist.name,
          time: timeInput.value,
          endTime: endTime,
          duration: Number.parseInt(durationSelect.value),
          appointmentType: serviceSelect.value,
          nhsNumber: nhsInput?.value || undefined,
          notes: notesInput?.value || undefined,
          color: pharmacist.color,
          contactNumber: contactNumberInput?.value || undefined,
          email: emailInput?.value || undefined,
        };
      }
      return appointment;
    });

    setAppointments(updatedAppointments);

    toast.success("Appointment updated", {
      description: `Appointment for ${patientNameInput.value} has been updated`,
    });

    setEditAppointmentOpen(false);
    setSelectedAppointment(null);
  };

  const deleteAppointment = () => {
    if (!selectedAppointment) return;

    setAppointments(
      appointments.filter((a) => a.id !== selectedAppointment.id)
    );

    toast.success("Appointment deleted", {
      description: `Appointment for ${selectedAppointment.patientName} has been removed`,
    });

    setConfirmDeleteOpen(false);
    setSelectedAppointment(null);
    setAppointmentDetailsOpen(false);
  };

  const handleDragStart = (appointment: Appointment) => {
    setDraggedAppointment(appointment);
  };

  const handleDragOver = (
    e: React.DragEvent,
    time: string,
    pharmacistId: string
  ) => {
    e.preventDefault();
    setDragOverTime(time);
    setDragOverPharmacist(pharmacistId);
  };

  const handleDrop = (
    e: React.DragEvent,
    time: string,
    pharmacistId: string
  ) => {
    e.preventDefault();

    if (!draggedAppointment) return;

    // Don't allow dropping on the same time and pharmacist
    if (
      draggedAppointment.time === time &&
      draggedAppointment.pharmacistId === pharmacistId
    ) {
      setDraggedAppointment(null);
      setDragOverTime(null);
      setDragOverPharmacist(null);
      return;
    }

    const pharmacist = pharmacists.find((p) => p.id === pharmacistId);
    if (!pharmacist) return;

    const endTime = calculateEndTime(time, draggedAppointment.duration);

    const updatedAppointments = appointments.map((appointment) => {
      if (appointment.id === draggedAppointment.id) {
        return {
          ...appointment,
          pharmacistId,
          pharmacistName: pharmacist.name,
          time,
          endTime,
          color: pharmacist.color,
        };
      }
      return appointment;
    });

    setAppointments(updatedAppointments);

    toast.success("Appointment rescheduled", {
      description: `Appointment for ${draggedAppointment.patientName} moved to ${time} with ${pharmacist.name}`,
    });

    setDraggedAppointment(null);
    setDragOverTime(null);
    setDragOverPharmacist(null);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setDragOverTime(null);
    setDragOverPharmacist(null);
  };

  const isSlotAvailable = (time: string, pharmacistId: string) => {
    // Check if the pharmacist is available at this time
    const pharmacist = pharmacists.find((p) => p.id === pharmacistId);
    if (!pharmacist) return false;

    const dayOfWeek = date.getDay();
    if (!pharmacist.availability.days.includes(dayOfWeek)) return false;

    if (
      time < pharmacist.availability.start ||
      time >= pharmacist.availability.end
    )
      return false;

    // Check if there's no appointment at this time
    return !filteredAppointments.some(
      (a) => a.pharmacistId === pharmacistId && a.time === time
    );
  };

  const isTimeSlotHighlighted = (time: string, pharmacistId: string) => {
    return dragOverTime === time && dragOverPharmacist === pharmacistId;
  };

  const getAppointmentsAtTime = (
    time: string,
    pharmacistId: string,
    day?: Date
  ) => {
    return filteredAppointments.filter((a) => {
      if (day && !isSameDay(a.date, day)) return false;
      return a.pharmacistId === pharmacistId && a.time === time;
    });
  };

  const getDurationFromService = (serviceId: string) => {
    const service = serviceTypes.find((s) => s.id === serviceId);
    return service ? service.duration : 15;
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    setSelectedDuration(getDurationFromService(serviceId));
  };

  const checkInPatient = (
    appointmentId: string,
    method: "counter" | "kiosk" | "online" | "sms" = "counter"
  ) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status: "checked-in",
              checkInMethod: method,
              waitingTime: 0,
            }
          : appointment
      )
    );

    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      toast.success("Patient checked in", {
        description: `${appointment.patientName} has been added to the queue`,
      });
    }
  };

  const startConsultation = (appointmentId: string) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: "in-progress" }
          : appointment
      )
    );

    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      toast.success("Consultation started", {
        description: `${appointment.patientName} is now with ${appointment.pharmacistName}`,
      });
    }
  };

  const completeConsultation = (appointmentId: string) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: "completed" }
          : appointment
      )
    );

    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      toast.success("Consultation completed", {
        description: `${appointment.patientName}'s appointment has been completed`,
      });
    }
  };

  const markNoShow = (appointmentId: string) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: "no-show" }
          : appointment
      )
    );

    const appointment = appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      toast.error("Patient marked as no-show", {
        description: `${appointment.patientName} did not attend their appointment`,
      });
    }
  };

  const addToQueue = (appointment: Appointment) => {
    // This would integrate with the queue management system
    // For now, we'll just mark the appointment as checked-in
    checkInPatient(appointment.id);
  };

  const addToWaitlist = (
    patientName: string,
    nhsNumber: string,
    reason: string,
    priority: string,
    contactNumber?: string
  ) => {
    const newWaitlistItem = {
      id: `w${waitlist.length + 1}`,
      patientName,
      patientId: `p${Date.now()}`,
      nhsNumber,
      reason,
      priority: priority as "normal" | "urgent" | "follow-up",
      arrivalTime: format(new Date(), "HH:mm"),
      estimatedWait: priority === "urgent" ? 10 : 30,
      status: "waiting" as const,
      notes: "",
      contactNumber,
    };

    setWaitlist([...waitlist, newWaitlistItem]);

    toast.success("Added to waitlist", {
      description: `${patientName} has been added to the waitlist`,
    });

    return newWaitlistItem;
  };

  const updateCheckInSettings = (settings: Partial<CheckInSettings>) => {
    setCheckInSettings({ ...checkInSettings, ...settings });

    toast.success("Settings updated", {
      description: "Check-in settings have been updated",
    });
  };

  const addWalkInPatient = () => {
    const patientNameInput = document.getElementById(
      "walkin-patient"
    ) as HTMLInputElement;
    const nhsInput = document.getElementById("walkin-nhs") as HTMLInputElement;
    const reasonInput = document.getElementById(
      "walkin-reason"
    ) as HTMLSelectElement;
    const priorityInput = document.getElementById(
      "walkin-priority"
    ) as HTMLSelectElement;
    const contactNumberInput = document.getElementById(
      "walkin-contact"
    ) as HTMLInputElement;
    const pharmacistInput = document.getElementById(
      "walkin-pharmacist"
    ) as HTMLSelectElement;

    if (!patientNameInput?.value || !reasonInput?.value) {
      toast.error("Missing information", {
        description: "Please enter patient name and reason for visit",
      });
      return;
    }

    // First add to waitlist
    const waitlistItem = addToWaitlist(
      patientNameInput.value,
      nhsInput?.value || "",
      reasonInput.value,
      priorityInput.value,
      contactNumberInput?.value
    );

    // If pharmacist is selected, create an appointment
    if (pharmacistInput?.value) {
      const pharmacist = pharmacists.find(
        (p) => p.id === pharmacistInput.value
      );
      if (pharmacist) {
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, "0");
        const currentMinute = Math.floor(now.getMinutes() / 15) * 15;
        const time = `${currentHour}:${currentMinute
          .toString()
          .padStart(2, "0")}`;
        const duration = 15;
        const endTime = calculateEndTime(time, duration);

        const newAppointment: Appointment = {
          id: `app-${Date.now()}`,
          patientId: waitlistItem.patientId,
          patientName: patientNameInput.value,
          pharmacistId: pharmacistInput.value,
          pharmacistName: pharmacist.name,
          date: new Date(),
          time,
          endTime,
          duration,
          room: `Consultation Room ${Math.floor(Math.random() * 3) + 1}`,
          status: "checked-in",
          appointmentType: reasonInput.value,
          nhsNumber: nhsInput?.value || undefined,
          color: pharmacist.color,
          checkInMethod: "counter",
          waitingTime: 0,
          contactNumber: contactNumberInput?.value,
        };

        setAppointments([...appointments, newAppointment]);
      }
    }

    toast.success("Walk-in patient added", {
      description: `${patientNameInput.value} has been added to the system`,
    });

    setWalkInDialogOpen(false);
  };

  const sendSmsReminder = (appointmentId: string) => {
    setSendingReminder(true);

    // Simulate API call
    setTimeout(() => {
      const appointment = appointments.find((a) => a.id === appointmentId);
      if (appointment) {
        toast.success("SMS reminder sent", {
          description: `Reminder sent to ${appointment.patientName} at ${appointment.contactNumber}`,
        });
      }
      setSendingReminder(false);
      setSendSmsDialogOpen(false);
    }, 1500);
  };

  const renderPharmacistView = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {format(date, "EEEE, d MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(addDays(date, -1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(addDays(date, 1))}
            >
              Next Day <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointmentsByPharmacist.map((pharmacist) => (
            <Card key={pharmacist.id} className="overflow-hidden">
              <CardHeader className="pb-2 bg-muted/30">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={pharmacist.avatar || "/placeholder.svg"}
                        alt={pharmacist.name}
                      />
                      <AvatarFallback
                        className={`${pharmacist.color} text-white`}
                      >
                        {pharmacist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <CardTitle className="text-base leading-tight">
                        {pharmacist.name}
                      </CardTitle>
                      <CardDescription className="leading-tight">
                        {pharmacist.specialty}
                      </CardDescription>
                    </div>
                  </div>
                  {pharmacist.status && (
                    <div className="flex items-center gap-2 pl-12">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                          pharmacist.status
                        )}`}
                      />
                      <span className="text-sm capitalize">
                        {pharmacist.status}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4">
                {/* Current patient */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Current Patient</h4>
                  {pharmacist.currentPatient ? (
                    <div className="rounded-md bg-muted p-3 space-y-2">
                      <div>
                        <p className="font-medium">
                          {pharmacist.currentPatient.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pharmacist.currentPatient.appointmentType} •{" "}
                          {pharmacist.currentPatient.time}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          completeConsultation(pharmacist.currentPatient!.id)
                        }
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                      No active patient
                    </div>
                  )}
                </div>

                {/* Waiting patients */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium">
                      Waiting ({pharmacist.waitingPatients.length})
                    </h4>
                    {pharmacist.waitingPatients.length > 0 &&
                      !pharmacist.currentPatient && (
                        <Button
                          size="sm"
                          onClick={() =>
                            startConsultation(pharmacist.waitingPatients[0].id)
                          }
                        >
                          Call Next
                        </Button>
                      )}
                  </div>

                  {pharmacist.waitingPatients.length > 0 ? (
                    <div className="space-y-2">
                      {pharmacist.waitingPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="rounded-md border p-3 space-y-2"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {patient.patientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {patient.appointmentType} • Waiting:{" "}
                              {patient.waitingTime} min
                            </p>
                          </div>
                          <div className="flex justify-between items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => startConsultation(patient.id)}
                            >
                              Start
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => markNoShow(patient.id)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Mark as no-show
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAppointment(patient);
                                    setSendSmsDialogOpen(true);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Send message
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAppointment(patient);
                                    setSendSmsDialogOpen(true);
                                  }}
                                >
                                  <Bell className="h-4 w-4 mr-2" />
                                  Send reminder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                      No patients waiting
                    </div>
                  )}
                </div>

                {/* Today's schedule */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Today's Schedule ({pharmacist.appointments.length})
                  </h4>
                  {pharmacist.appointments.length > 0 ? (
                    <div className="space-y-2">
                      {pharmacist.appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="rounded-md border p-3 space-y-2 cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setAppointmentDetailsOpen(true);
                          }}
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {appointment.patientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appointment.time} - {appointment.endTime} •{" "}
                              {appointment.appointmentType}
                            </p>
                          </div>
                          {appointment.status === "scheduled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation(); // prevent parent onClick
                                checkInPatient(appointment.id);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Check In
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                      No appointments scheduled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderQueueView = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <h3 className="text-lg font-medium">
            Today's Queue - {format(new Date(), "EEEE, d MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients..."
                className="pl-8 w-[220px] h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setWalkInDialogOpen(true)} className="h-9">
              <UserPlus className="h-4 w-4 mr-2" />
              Walk-in
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active consultations */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base flex items-center">
                <UserCog className="h-5 w-5 mr-2 text-blue-500" />
                Active Consultations
              </CardTitle>
              <CardDescription>
                Patients currently with pharmacists
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {todaysAppointments.filter((a) => a.status === "in-progress")
                .length > 0 ? (
                <div className="space-y-3">
                  {todaysAppointments
                    .filter((a) => a.status === "in-progress")
                    .map((appointment) => {
                      const pharmacist = pharmacists.find(
                        (p) => p.id === appointment.pharmacistId
                      );
                      return (
                        <div
                          key={appointment.id}
                          className="p-3 border rounded-md hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`h-3 w-3 rounded-full ${appointment.color}`}
                            ></div>
                            <p className="font-medium truncate">
                              {appointment.patientName}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">
                            <p>With: {appointment.pharmacistName}</p>
                            <p>
                              {appointment.appointmentType} • {appointment.room}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => completeConsultation(appointment.id)}
                            className="w-full"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No active consultations
                </div>
              )}
            </CardContent>
          </Card>

          {/* Waiting patients */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-500" />
                Waiting Patients
              </CardTitle>
              <CardDescription>
                Patients checked in and waiting to be seen
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {todaysAppointments.filter((a) => a.status === "checked-in")
                .length > 0 ? (
                <div className="space-y-3">
                  {todaysAppointments
                    .filter((a) => a.status === "checked-in")
                    .sort((a, b) => (b.waitingTime || 0) - (a.waitingTime || 0))
                    .map((appointment) => {
                      const pharmacist = pharmacists.find(
                        (p) => p.id === appointment.pharmacistId
                      );
                      return (
                        <div
                          key={appointment.id}
                          className="p-3 border rounded-md hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`h-3 w-3 rounded-full ${appointment.color}`}
                            ></div>
                            <p className="font-medium truncate">
                              {appointment.patientName}
                            </p>
                            <Badge
                              variant="outline"
                              className="ml-1 whitespace-nowrap"
                            >
                              {appointment.waitingTime} min
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">
                            <p>For: {appointment.pharmacistName}</p>
                            <p>
                              {appointment.appointmentType} • {appointment.time}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => startConsultation(appointment.id)}
                            >
                              Start
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => markNoShow(appointment.id)}
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Mark as no-show
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setSendSmsDialogOpen(true);
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Send message
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setSendSmsDialogOpen(true);
                                  }}
                                >
                                  <Bell className="h-4 w-4 mr-2" />
                                  Send reminder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No patients waiting
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming appointments */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-green-500" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Scheduled appointments for today
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {scheduledTodayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {scheduledTodayAppointments.map((appointment) => {
                    const pharmacist = pharmacists.find(
                      (p) => p.id === appointment.pharmacistId
                    );
                    return (
                      <div
                        key={appointment.id}
                        className="p-3 border rounded-md hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`h-3 w-3 rounded-full ${appointment.color}`}
                          ></div>
                          <p className="font-medium truncate">
                            {appointment.patientName}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">
                          <p>
                            {appointment.time} • {appointment.pharmacistName}
                          </p>
                          <p>{appointment.appointmentType}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => checkInPatient(appointment.id)}
                          className="whitespace-nowrap"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No upcoming appointments
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Walk-in patient dialog */}
        <Dialog open={walkInDialogOpen} onOpenChange={setWalkInDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register Walk-in Patient</DialogTitle>
              <DialogDescription>
                Add a walk-in patient to the queue or create an appointment
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="walkin-patient">Patient Name *</Label>
                  <Input id="walkin-patient" placeholder="Enter patient name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="walkin-nhs">NHS Number</Label>
                  <Input id="walkin-nhs" placeholder="Enter NHS number" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walkin-contact">Contact Number</Label>
                <Input id="walkin-contact" placeholder="Enter contact number" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="walkin-reason">Reason for Visit *</Label>
                  <Select>
                    <SelectTrigger id="walkin-reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.id} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="walkin-priority">Priority</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger id="walkin-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walkin-pharmacist">Assign to Pharmacist</Label>
                <Select>
                  <SelectTrigger id="walkin-pharmacist">
                    <SelectValue placeholder="Select pharmacist" />
                  </SelectTrigger>
                  <SelectContent>
                    {pharmacists.map((pharmacist) => (
                      <SelectItem key={pharmacist.id} value={pharmacist.id}>
                        {pharmacist.name} ({pharmacist.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setWalkInDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={addWalkInPatient}>Add Patient</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SMS reminder dialog */}
        <Dialog open={sendSmsDialogOpen} onOpenChange={setSendSmsDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Send SMS Reminder</DialogTitle>
              <DialogDescription>
                Send a reminder message to the patient
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="grid gap-4 py-4">
                <div>
                  <p className="font-medium">
                    {selectedAppointment.patientName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.contactNumber ||
                      "No contact number available"}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sms-message">Message</Label>
                  <Textarea
                    id="sms-message"
                    defaultValue={`Hi ${selectedAppointment.patientName}, this is a reminder that your appointment is scheduled for today at ${selectedAppointment.time}. Please check in at the pharmacy counter when you arrive.`}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSendSmsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedAppointment && sendSmsReminder(selectedAppointment.id)
                }
                disabled={
                  sendingReminder || !selectedAppointment?.contactNumber
                }
              >
                {sendingReminder && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send SMS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Appointment details dialog */}
        <Dialog
          open={appointmentDetailsOpen}
          onOpenChange={setAppointmentDetailsOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            {selectedAppointment && (
              <>
                <DialogHeader>
                  <DialogTitle>Appointment Details</DialogTitle>
                  <DialogDescription>
                    {format(selectedAppointment.date, "PPP")} •{" "}
                    {selectedAppointment.time} - {selectedAppointment.endTime}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">
                      {selectedAppointment.patientName}
                    </h3>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedAppointment.status)}
                      {selectedAppointment.checkInMethod &&
                        getCheckInMethodBadge(
                          selectedAppointment.checkInMethod
                        )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">NHS Number</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.nhsNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Service</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.appointmentType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Pharmacist</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.pharmacistName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Room</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.room}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contact</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.contactNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {selectedAppointment.notes && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Notes
                      </p>
                      <p className="text-sm mt-1">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPatientHistoryOpen(true);
                        setAppointmentDetailsOpen(false);
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View History
                    </Button>

                    {selectedAppointment.contactNumber && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSendSmsDialogOpen(true);
                          setAppointmentDetailsOpen(false);
                        }}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send SMS
                      </Button>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <div className="flex w-full justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditAppointmentOpen(true);
                        setAppointmentDetailsOpen(false);
                      }}
                    >
                      Edit Appointment
                    </Button>
                    <div className="flex gap-2">
                      {selectedAppointment.status === "scheduled" && (
                        <Button
                          onClick={() => {
                            checkInPatient(selectedAppointment.id);
                            setAppointmentDetailsOpen(false);
                          }}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Check In
                        </Button>
                      )}
                      {selectedAppointment.status === "checked-in" && (
                        <Button
                          onClick={() => {
                            startConsultation(selectedAppointment.id);
                            setAppointmentDetailsOpen(false);
                          }}
                        >
                          Start Consultation
                        </Button>
                      )}
                      {selectedAppointment.status === "in-progress" && (
                        <Button
                          onClick={() => {
                            completeConsultation(selectedAppointment.id);
                            setAppointmentDetailsOpen(false);
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Patient history dialog */}
        <Dialog open={patientHistoryOpen} onOpenChange={setPatientHistoryOpen}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedAppointment && (
              <>
                <DialogHeader>
                  <DialogTitle>Patient History</DialogTitle>
                  <DialogDescription>
                    Medical history for {selectedAppointment.patientName}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {selectedAppointment.patientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">
                        {selectedAppointment.patientName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        NHS: {selectedAppointment.nhsNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h4 className="font-medium mb-2">Appointment History</h4>

                  {selectedAppointment.history &&
                  selectedAppointment.history.length > 0 ? (
                    <div className="space-y-4">
                      {selectedAppointment.history.map((item) => (
                        <div key={item.id} className="border rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{item.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(item.date, "PPP")}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Pharmacist: {item.pharmacistName}
                          </p>
                          <p className="text-sm mt-2">{item.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                      No previous appointments found
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setPatientHistoryOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {format(date, "EEEE, d MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(addDays(date, -1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDate(addDays(date, 1))}
            >
              Next Day <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[600px]" ref={dayViewRef}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `auto repeat(${visiblePharmacists.length}, 1fr)`,
              width: "100%",
            }}
          >
            {/* Header row with pharmacist names */}
            <div className="sticky top-0 z-10 bg-background border-b pb-2">
              <div className="w-16"></div>
            </div>
            {visiblePharmacists.map((pharmacist) => (
              <div
                key={pharmacist.id}
                className="sticky top-0 z-10 bg-background border-b pb-2 px-2 text-center"
              >
                <div className="flex flex-col items-center">
                  <Avatar className="h-8 w-8 mb-1">
                    <AvatarImage
                      src={pharmacist.avatar || "/placeholder.svg"}
                      alt={pharmacist.name}
                    />
                    <AvatarFallback
                      className={`${pharmacist.color} text-white`}
                    >
                      {pharmacist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{pharmacist.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {pharmacist.specialty}
                  </span>
                </div>
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((time, index) => (
              <React.Fragment key={time}>
                <div
                  ref={(el) => (timeSlotRefs.current[time] = el)}
                  className={`w-16 py-2 text-sm text-muted-foreground sticky left-0 bg-background z-10 ${
                    index % 4 === 0 ? "font-medium" : ""
                  }`}
                >
                  {time}
                </div>

                {visiblePharmacists.map((pharmacist) => {
                  const isAvailable = isSlotAvailable(time, pharmacist.id);
                  const isHighlighted = isTimeSlotHighlighted(
                    time,
                    pharmacist.id
                  );
                  const appointmentsAtTime = getAppointmentsAtTime(
                    time,
                    pharmacist.id
                  );

                  return (
                    <div
                      key={`${time}-${pharmacist.id}`}
                      className={`relative min-h-[3rem] border-t ${
                        isHighlighted ? "bg-muted/50" : ""
                      } ${
                        !isAvailable && appointmentsAtTime.length === 0
                          ? "bg-muted/20"
                          : ""
                      }`}
                      onDragOver={(e) => handleDragOver(e, time, pharmacist.id)}
                      onDrop={(e) => handleDrop(e, time, pharmacist.id)}
                    >
                      {appointmentsAtTime.length > 0 ? (
                        <div className="absolute top-0 left-0 right-0 p-1">
                          {appointmentsAtTime.map((appointment) => (
                            <div
                              key={appointment.id}
                              className={`rounded-md p-2 mb-1 cursor-move ${appointment.color.replace(
                                "bg-",
                                "bg-opacity-20 text-"
                              )} border shadow-sm`}
                              draggable
                              onDragStart={() => handleDragStart(appointment)}
                              onDragEnd={handleDragEnd}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setAppointmentDetailsOpen(true);
                              }}
                            >
                              <div className="flex items-center justify-between p-1 relative group">
                                <div className="font-medium text-sm">
                                  {appointment.patientName}
                                </div>

                                {/* Hover tooltip to show all appointment details */}
                                <div className="absolute z-50 hidden group-hover:block w-64 p-3 bg-white dark:bg-zinc-900 shadow-lg rounded-lg border -left-2 top-full mt-1">
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-semibold">
                                        {appointment.patientName}
                                      </h4>
                                      {getStatusBadge(appointment.status)}
                                    </div>
                                    <p className="text-xs flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {appointment.time} - {appointment.endTime}{" "}
                                      ({appointment.duration} mins)
                                    </p>
                                    <p className="text-xs flex items-center gap-1">
                                      <div
                                        className={`w-2 h-2 rounded-full ${appointment.color}`}
                                      ></div>
                                      {appointment.appointmentType}
                                    </p>
                                    <p className="text-xs">
                                      {appointment.pharmacistName} •{" "}
                                      {appointment.room}
                                    </p>
                                    {appointment.nhsNumber && (
                                      <p className="text-xs">
                                        NHS: {appointment.nhsNumber}
                                      </p>
                                    )}
                                    {appointment.contactNumber && (
                                      <p className="text-xs">
                                        Contact: {appointment.contactNumber}
                                      </p>
                                    )}
                                    {appointment.notes && (
                                      <p className="text-xs border-t pt-1 mt-1">
                                        Notes: {appointment.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        isAvailable && (
                          <Button
                            variant="ghost"
                            className="absolute top-0 left-0 right-0 h-full w-full opacity-0 hover:opacity-100 transition-opacity rounded-none"
                            onClick={() => {
                              setSelectedTime(time);
                              setSelectedPharmacist(pharmacist.id);
                              setAddAppointmentOpen(true);
                            }}
                          >
                            + Add
                          </Button>
                        )
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderFilterDialog = () => {
    return (
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Filter Appointments</DialogTitle>
            <DialogDescription>
              Set filters to narrow down appointments
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter || undefined}
                    onSelect={(date) => setDateFilter(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Pharmacist</Label>
              <Select
                value={filteredPharmacistId || ""}
                onValueChange={(value) => {
                  setFilteredPharmacistId(value || null);
                  setShowAllPharmacists(!value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All pharmacists" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All pharmacists</SelectItem>
                  {pharmacists.map((pharmacist) => (
                    <SelectItem key={pharmacist.id} value={pharmacist.id}>
                      {pharmacist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Service Type</Label>
              <Select
                value={serviceFilter || ""}
                onValueChange={(value) => setServiceFilter(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All services</SelectItem>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.id} value={service.name}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={statusFilter || ""}
                onValueChange={(value) => setStatusFilter(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDateFilter(null);
                setFilteredPharmacistId(null);
                setShowAllPharmacists(true);
                setServiceFilter(null);
                setStatusFilter(null);
                setFilterDialogOpen(false);
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-80">
          <Card className="p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search appointments..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="queue">Queue</TabsTrigger>
                  <TabsTrigger value="pharmacist">Staff</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
              initialFocus
            />

            <div className="mt-4">
              <Dialog
                open={addAppointmentOpen}
                onOpenChange={setAddAppointmentOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Add Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Appointment</DialogTitle>
                    <DialogDescription>
                      Schedule a new appointment for {format(date, "PPP")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid gap-2">
                      <Label htmlFor="patient">Patient Name</Label>
                      <Input id="patient" placeholder="Enter patient name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="nhs">NHS Number (optional)</Label>
                      <Input id="nhs" placeholder="Enter NHS number" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contactNumber">
                        Contact Number (optional)
                      </Label>
                      <Input
                        id="contactNumber"
                        placeholder="Enter contact number"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email (optional)</Label>
                      <Input
                        id="email"
                        placeholder="Enter email address"
                        type="email"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="service">Service Type</Label>
                      <Select onValueChange={handleServiceChange}>
                        <SelectTrigger id="service">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} ({service.duration} min)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select
                        value={selectedDuration.toString()}
                        onValueChange={(value) =>
                          setSelectedDuration(Number.parseInt(value))
                        }
                      >
                        <SelectTrigger id="duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="20">20 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="pharmacist">Pharmacist</Label>
                      <Select onValueChange={setSelectedPharmacist}>
                        <SelectTrigger id="pharmacist">
                          <SelectValue placeholder="Select pharmacist" />
                        </SelectTrigger>
                        <SelectContent>
                          {pharmacists.map((pharmacist) => (
                            <SelectItem
                              key={pharmacist.id}
                              value={pharmacist.id}
                            >
                              {pharmacist.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Enter any notes"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddAppointmentOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addAppointment}>Add Appointment</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-4">
              <Dialog
                open={editAppointmentOpen}
                onOpenChange={setEditAppointmentOpen}
              >
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Appointment</DialogTitle>
                    <DialogDescription>
                      Edit the appointment details
                    </DialogDescription>
                  </DialogHeader>
                  {selectedAppointment && (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-patient">Patient Name</Label>
                        <Input
                          id="edit-patient"
                          placeholder="Enter patient name"
                          defaultValue={selectedAppointment.patientName}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-nhs">NHS Number (optional)</Label>
                        <Input
                          id="edit-nhs"
                          placeholder="Enter NHS number"
                          defaultValue={selectedAppointment.nhsNumber || ""}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-contactNumber">
                          Contact Number (optional)
                        </Label>
                        <Input
                          id="edit-contactNumber"
                          placeholder="Enter contact number"
                          defaultValue={selectedAppointment.contactNumber || ""}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-email">Email (optional)</Label>
                        <Input
                          id="edit-email"
                          placeholder="Enter email address"
                          type="email"
                          defaultValue={selectedAppointment.email || ""}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-time">Time</Label>
                        <Input
                          id="edit-time"
                          type="time"
                          defaultValue={selectedAppointment.time}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-service">Service Type</Label>
                        <Select
                          defaultValue={selectedAppointment.appointmentType}
                        >
                          <SelectTrigger id="edit-service">
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((service) => (
                              <SelectItem key={service.id} value={service.name}>
                                {service.name} ({service.duration} min)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-duration">
                          Duration (minutes)
                        </Label>
                        <Select
                          defaultValue={selectedAppointment.duration.toString()}
                        >
                          <SelectTrigger id="edit-duration">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="20">20 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-pharmacist">Pharmacist</Label>
                        <Select defaultValue={selectedAppointment.pharmacistId}>
                          <SelectTrigger id="edit-pharmacist">
                            <SelectValue placeholder="Select pharmacist" />
                          </SelectTrigger>
                          <SelectContent>
                            {pharmacists.map((pharmacist) => (
                              <SelectItem
                                key={pharmacist.id}
                                value={pharmacist.id}
                              >
                                {pharmacist.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-notes">Notes (optional)</Label>
                        <Textarea
                          id="edit-notes"
                          placeholder="Enter any notes"
                          rows={3}
                          defaultValue={selectedAppointment.notes || ""}
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditAppointmentOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={updateAppointment}>
                      Update Appointment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilterDialogOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="mt-4">
              <Dialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
              >
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Delete Appointment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this appointment?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmDeleteOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={deleteAppointment}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-4">
              <Dialog
                open={checkInSettingsOpen}
                onOpenChange={setCheckInSettingsOpen}
              >
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Check-in Settings</DialogTitle>
                    <DialogDescription>
                      Configure check-in options for patients
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="kiosk-enabled">
                        Enable Kiosk Check-in
                      </Label>
                      <Input
                        type="checkbox"
                        id="kiosk-enabled"
                        checked={checkInSettings.kioskEnabled}
                        onChange={(e) =>
                          updateCheckInSettings({
                            kioskEnabled: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="online-enabled">
                        Enable Online Check-in
                      </Label>
                      <Input
                        type="checkbox"
                        id="online-enabled"
                        checked={checkInSettings.onlineEnabled}
                        onChange={(e) =>
                          updateCheckInSettings({
                            onlineEnabled: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-enabled">Enable SMS Check-in</Label>
                      <Input
                        type="checkbox"
                        id="sms-enabled"
                        checked={checkInSettings.smsEnabled}
                        onChange={(e) =>
                          updateCheckInSettings({
                            smsEnabled: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="kiosk-hours-start">Kiosk Hours</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          id="kiosk-hours-start"
                          defaultValue={checkInSettings.kioskHours.start}
                          onChange={(e) =>
                            updateCheckInSettings({
                              kioskHours: {
                                ...checkInSettings.kioskHours,
                                start: e.target.value,
                              },
                            })
                          }
                        />
                        <Input
                          type="time"
                          id="kiosk-hours-end"
                          defaultValue={checkInSettings.kioskHours.end}
                          onChange={(e) =>
                            updateCheckInSettings({
                              kioskHours: {
                                ...checkInSettings.kioskHours,
                                end: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-nhs">Require NHS Number</Label>
                      <Input
                        type="checkbox"
                        id="require-nhs"
                        checked={checkInSettings.requireNHS}
                        onChange={(e) =>
                          updateCheckInSettings({
                            requireNHS: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-walkin">
                        Allow Walk-in Patients
                      </Label>
                      <Input
                        type="checkbox"
                        id="allow-walkin"
                        checked={checkInSettings.allowWalkIn}
                        onChange={(e) =>
                          updateCheckInSettings({
                            allowWalkIn: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="send-reminders">
                        Send Appointment Reminders
                      </Label>
                      <Input
                        type="checkbox"
                        id="send-reminders"
                        checked={checkInSettings.sendReminders}
                        onChange={(e) =>
                          updateCheckInSettings({
                            sendReminders: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reminder-time">
                        Reminder Time (hours before appointment)
                      </Label>
                      <Input
                        type="number"
                        id="reminder-time"
                        defaultValue={checkInSettings.reminderTime}
                        onChange={(e) =>
                          updateCheckInSettings({
                            reminderTime: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCheckInSettingsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setCheckInSettingsOpen(false)}>
                      Save Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {renderFilterDialog()}
          </Card>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading...
            </div>
          ) : (
            <>
              {viewMode === "day" && renderDayView()}
              {viewMode === "week" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {format(weekStartDate, "MMMM d")} -{" "}
                      {format(addDays(weekStartDate, 6), "MMMM d")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevWeek}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous Week
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setWeekStartDate(
                            startOfWeek(new Date(), { weekStartsOn: 1 })
                          )
                        }
                      >
                        This Week
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextWeek}
                      >
                        Next Week
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    {weekDays.map((day) => (
                      <Card key={day.toISOString()}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            {format(day, "EEEE, d MMMM")}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          {filteredAppointments
                            .filter((appointment) =>
                              isSameDay(appointment.date, day)
                            )
                            .map((appointment) => (
                              <div
                                key={appointment.id}
                                className="rounded-md p-2 mb-1 cursor-pointer hover:bg-muted/50"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setAppointmentDetailsOpen(true);
                                }}
                              >
                                <p className="font-medium text-sm">
                                  {appointment.patientName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {appointment.time} - {appointment.endTime}
                                </p>
                              </div>
                            ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {viewMode === "queue" && renderQueueView()}
              {viewMode === "pharmacist" && renderPharmacistView()}
              {viewMode === "list" && (
                <div>
                  <h2>List View</h2>
                  {/* Implement list view here */}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
