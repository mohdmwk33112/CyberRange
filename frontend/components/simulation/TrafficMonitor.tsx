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
                            <stop offset="5%" style={{ stopColor: 'var(--primary)' }} stopOpacity={0.4} />
                            <stop offset="95%" style={{ stopColor: 'var(--primary)' }} stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} strokeOpacity={0.3} />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={20}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                            fontSize: '12px',
                            color: 'var(--card-foreground)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)'
                        }}
                        itemStyle={{ color: 'var(--primary)' }}
                        labelStyle={{ color: 'var(--muted-foreground)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="bytes"
                        style={{ stroke: 'var(--primary)' }}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorBytes)"
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
