import { Activity, Bot, MessageSquare, MousePointerClick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/dashboard-shell";

const metrics = [
  { label: "Conversion from chat", value: "18.4%", icon: MousePointerClick },
  { label: "Avg response confidence", value: "94%", icon: Bot },
  { label: "Open conversations", value: "327", icon: MessageSquare },
  { label: "Resolution rate", value: "81%", icon: Activity }
];

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="A concise read on conversation quality, buying intent, and sales movement." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
              </div>
              <metric.icon className="h-6 w-6 text-violet-500" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>AI insight summary</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {["Sneakers are receiving the highest buying intent.", "Delivery questions appear in 41% of chats.", "Customers respond best to product cards with clear availability."].map((item) => (
            <div key={item} className="rounded-2xl border bg-background p-4 text-sm leading-6 text-muted-foreground">{item}</div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
