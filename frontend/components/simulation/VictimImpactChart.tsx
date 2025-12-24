'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Activity, Zap } from 'lucide-react';

interface MetricPoint {
    timestamp: number;
    value: number;
    type?: string;
}

interface VictimImpactChartProps {
    logs: any[];
    scenarioSlug: string;
}

export const VictimImpactChart: React.FC<VictimImpactChartProps> = ({ logs, scenarioSlug }) => {
    // Process logs to derive impact metrics
    const chartData = useMemo(() => {
        const last30Logs = logs.filter(l => l.perspective === 'victim').slice(-50);

        // This is a simplified derivation for visualization
        // In a real app, these would come from actual metrics
        return last30Logs.map((log, index) => {
            const baseValue = 10 + Math.sin(index / 5) * 5;
            let impactFactor = 1;

            if (scenarioSlug === 'ddos') {
                impactFactor = 1 + (logs.length / 100); // Simulate degradation as attack progresses
            } else if (scenarioSlug === 'bot') {
                impactFactor = 1 + (logs.filter(l => l.message?.includes('Attempt')).length / 50);
            }

            return {
                time: new Date(log.timestamp * 1000).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
                latency: Math.round(baseValue * impactFactor * 10) / 10,
                load: Math.min(100, Math.round(index * 2 * impactFactor)),
            };
        });
    }, [logs, scenarioSlug]);

    if (logs.length < 5) {
        return (
            <Card className="bg-card/50 border-border/50">
                <CardContent className="h-48 flex items-center justify-center text-muted-foreground text-xs uppercase font-bold tracking-widest animate-pulse">
                    Analyzing Impact Data...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 border-border/50 shadow-lg">
            <CardHeader className="p-4 pb-0">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-sm font-bold tracking-tight uppercase">Resource Impact Analysis</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#888888"
                            fontSize={8}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={8}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #1e293b',
                                fontSize: '10px',
                                borderRadius: '4px'
                            }}
                            itemStyle={{ padding: '0px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="latency"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorLatency)"
                            name="Latency (ms)"
                        />
                        <Area
                            type="monotone"
                            dataKey="load"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorLoad)"
                            name="System Load %"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
