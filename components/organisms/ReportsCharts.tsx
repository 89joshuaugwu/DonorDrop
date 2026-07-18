"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/Card";

export interface ReportsData {
  bloodTypeDistribution: { bloodType: string; count: number }[];
  fulfillmentRate: number;
  avgResponseTimeMinutes: number;
}

export default function ReportsCharts({ data }: { data: ReportsData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm text-brand-text-secondary">Request Fulfillment Rate</p>
          <p className="text-3xl font-extrabold tabular-nums mt-1">
            {data.fulfillmentRate.toFixed(0)}%
          </p>
        </Card>
        <Card>
          <p className="text-sm text-brand-text-secondary">Avg. Response Time</p>
          <p className="text-3xl font-extrabold tabular-nums mt-1">
            {data.avgResponseTimeMinutes.toFixed(0)} min
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Blood Type Distribution (Donors)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.bloodTypeDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="bloodType" stroke="#64748B" fontSize={12} />
            <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#DC2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
