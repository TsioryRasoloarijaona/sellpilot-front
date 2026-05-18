"use client";

import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { PageHeader } from "@/components/dashboard/dashboard-shell";

export default function SettingsPage() {
  const owner = useAuthStore((state) => state.owner);

  return (
    <>
      <PageHeader title="Settings" description="Profile, workspace preferences, and notification controls." />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader><CardTitle>Profile settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Email"><Input value={owner?.email || "owner@sellpilot.ai"} readOnly /></Field>
            <Field label="Workspace name"><Input defaultValue="SellPilot Commerce" /></Field>
            <Button>Save changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {["New order alerts", "Low stock warnings", "Daily AI conversation digest"].map((item) => (
              <label key={item} className="flex items-center justify-between rounded-xl border p-4 text-sm">
                {item}
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
