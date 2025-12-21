'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Terminal, ShieldAlert, Activity } from 'lucide-react';

interface LogEntry {
    type: string;
    message: string;
    timestamp: number;
    metrics?: any;
}

interface SimulationConsoleProps {
    logs: LogEntry[];
}

export const SimulationConsole: React.FC<SimulationConsoleProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-500 hover:bg-green-600';
            case 'warning': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'error': return 'bg-red-500 hover:bg-red-600';
            case 'attack': return 'bg-purple-500 hover:bg-purple-600';
            case 'phase': return 'bg-blue-500 hover:bg-blue-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden font-mono text-sm h-[400px] flex flex-col">
            <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="font-bold text-primary">ATTACK_SIM_CONSOLE_V1</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 animate-pulse text-green-500" />
                        LIVE
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                <div className="flex flex-col gap-2">
                    {logs.length === 0 && (
                        <div className="text-muted-foreground italic text-center py-10 opacity-50">
                            Waiting for simulation logs...
                        </div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-muted-foreground whitespace-nowrap text-[10px] mt-1">
                                {new Date(log.timestamp * 1000).toLocaleTimeString()}
                            </span>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-start gap-2">
                                    <Badge variant="secondary" className={`${getBadgeColor(log.type)} text-white border-0 capitalize`}>
                                        {log.type}
                                    </Badge>
                                    <span className={`break-all ${log.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                                        {log.message}
                                    </span>
                                </div>
                                {log.metrics && Object.keys(log.metrics).length > 0 && (
                                    <div className="bg-white/5 rounded p-2 text-xs grid grid-cols-2 gap-2 mt-1 w-fit">
                                        {Object.entries(log.metrics).map(([k, v]) => (
                                            <div key={k} className="flex gap-2">
                                                <span className="text-gray-500">{k}:</span>
                                                <span className="text-green-300 font-bold">{String(v)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
