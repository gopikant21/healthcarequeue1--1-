import { AppointmentCalendar } from "@/components/appointment-calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ListFilter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
            <p className="text-muted-foreground">View and manage appointments for North Road Pharmacy</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ListFilter className="h-5 w-5" />
              <span className="sr-only">Filter</span>
            </Button>
            <span className="text-lg font-medium">Filter</span>
          </div>
        </div>

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="appointments" className="rounded-md">
              Appointments
            </TabsTrigger>
            <TabsTrigger value="queue" className="rounded-md">
              Today's Queue
            </TabsTrigger>
            <TabsTrigger value="pharmacist" className="rounded-md">
              Pharmacist View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Appointment Calendar</CardTitle>
                <CardDescription>View and manage appointments for all pharmacists</CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentCalendar initialView="day" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Today's Queue</CardTitle>
                <CardDescription>Manage patients in today's queue</CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentCalendar initialView="queue" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pharmacist" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Pharmacist View</CardTitle>
                <CardDescription>View appointments by pharmacist</CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentCalendar initialView="pharmacist" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
