'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TrafficData {
    timestamp: number;
    bytes: number;
}

interface TrafficMonitorProps {
    data: TrafficData[];
}

export const TrafficMonitor: React.FC<TrafficMonitorProps> = ({ data }) => {
    // Format data for chart
    const chartData = data.map(d => ({
        time: new Date(d.timestamp * 1000).toLocaleTimeString(),
        bytes: d.bytes
    })).slice(-30); // Keep last 30 points

    return (
        <div className="h-[200px] w-full bg-card rounded-lg p-2 border border-border flex flex-col shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider pl-2">Network Traffic (Bytes)</h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorBytes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={20}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            fontSize: '12px',
                            color: 'hsl(var(--card-foreground))',
                            borderRadius: '6px'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="bytes"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorBytes)"
                        isAnimationActive={false} // Disable animation for smoother real-time updates
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
