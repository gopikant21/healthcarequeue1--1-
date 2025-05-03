import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QueueManagement } from "@/components/queue-management"

export default function QueuePage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Queue Management</h2>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Pharmacists</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="dispensing">Dispensing</TabsTrigger>
              <TabsTrigger value="technicians">Technicians</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Queue Status</CardTitle>
            <CardDescription>Manage patient queues for all pharmacists</CardDescription>
          </CardHeader>
          <CardContent>
            <QueueManagement />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
