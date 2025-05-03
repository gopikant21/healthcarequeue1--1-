"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("week")

  // Sample data for charts
  const waitTimeData = [
    { day: "Monday", average: 12, max: 25 },
    { day: "Tuesday", average: 15, max: 30 },
    { day: "Wednesday", average: 10, max: 22 },
    { day: "Thursday", average: 18, max: 35 },
    { day: "Friday", average: 20, max: 40 },
    { day: "Saturday", average: 8, max: 15 },
    { day: "Sunday", average: 5, max: 10 },
  ]

  const appointmentData = [
    { day: "Monday", scheduled: 45, completed: 42, noShow: 3 },
    { day: "Tuesday", scheduled: 50, completed: 48, noShow: 2 },
    { day: "Wednesday", scheduled: 38, completed: 35, noShow: 3 },
    { day: "Thursday", scheduled: 42, completed: 40, noShow: 2 },
    { day: "Friday", scheduled: 48, completed: 45, noShow: 3 },
    { day: "Saturday", scheduled: 25, completed: 23, noShow: 2 },
    { day: "Sunday", scheduled: 15, completed: 15, noShow: 0 },
  ]

  const doctorUtilizationData = [
    { doctor: "Dr. Johnson", patients: 38, utilization: 85 },
    { doctor: "Dr. Williams", patients: 32, utilization: 75 },
    { doctor: "Dr. Chen", patients: 42, utilization: 90 },
    { doctor: "Dr. Roberts", patients: 28, utilization: 65 },
    { doctor: "Dr. Thompson", patients: 35, utilization: 80 },
  ]

  const patientSatisfactionData = [
    { month: "Jan", score: 4.2 },
    { month: "Feb", score: 4.3 },
    { month: "Mar", score: 4.1 },
    { month: "Apr", score: 4.4 },
    { month: "May", score: 4.5 },
    { month: "Jun", score: 4.6 },
    { month: "Jul", score: 4.7 },
    { month: "Aug", score: 4.6 },
    { month: "Sep", score: 4.8 },
    { month: "Oct", score: 4.7 },
    { month: "Nov", score: 4.9 },
    { month: "Dec", score: 4.8 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">263</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 min</div>
            <p className="text-xs text-muted-foreground">-2 min from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctor Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">79%</div>
            <p className="text-xs text-muted-foreground">+3% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">-0.5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wait-times" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wait-times">Wait Times</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="utilization">Doctor Utilization</TabsTrigger>
          <TabsTrigger value="satisfaction">Patient Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="wait-times" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wait Time Analysis</CardTitle>
              <CardDescription>Average and maximum wait times by day</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  average: {
                    label: "Average Wait Time",
                    color: "hsl(var(--chart-1))",
                  },
                  max: {
                    label: "Maximum Wait Time",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <BarChart accessibilityLayer data={waitTimeData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => `${value} min`} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar dataKey="average" fill="var(--color-average)" radius={4} />
                  <Bar dataKey="max" fill="var(--color-max)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Statistics</CardTitle>
              <CardDescription>Scheduled, completed, and no-show appointments</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  scheduled: {
                    label: "Scheduled",
                    color: "hsl(var(--chart-1))",
                  },
                  completed: {
                    label: "Completed",
                    color: "hsl(var(--chart-2))",
                  },
                  noShow: {
                    label: "No-Show",
                    color: "hsl(var(--chart-3))",
                  },
                }}
              >
                <BarChart accessibilityLayer data={appointmentData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar dataKey="scheduled" fill="var(--color-scheduled)" radius={4} />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
                  <Bar dataKey="noShow" fill="var(--color-noShow)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Utilization</CardTitle>
              <CardDescription>Utilization rate and patients seen by doctor</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer
                config={{
                  patients: {
                    label: "Patients Seen",
                    color: "hsl(var(--chart-1))",
                  },
                  utilization: {
                    label: "Utilization (%)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <BarChart accessibilityLayer data={doctorUtilizationData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="doctor" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} tickMargin={10} axisLine={false} domain={[0, 100]} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                  <Bar dataKey="patients" fill="var(--color-patients)" radius={4} />
                  <Bar dataKey="utilization" fill="var(--color-utilization)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Satisfaction</CardTitle>
              <CardDescription>Average satisfaction score (1-5 scale)</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientSatisfactionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    domain={[3, 5]}
                    ticks={[3, 3.5, 4, 4.5, 5]}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
