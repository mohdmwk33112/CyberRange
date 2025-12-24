'use client';

import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Terminal, Shield, Activity } from 'lucide-react';

interface LogEntry {
    type: string;
    message: string;
    timestamp: number;
    metrics?: any;
    perspective?: 'attacker' | 'victim';
}

interface VictimConsoleProps {
    logs: LogEntry[];
}

export const VictimConsole: React.FC<VictimConsoleProps> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-emerald-500 hover:bg-emerald-600';
            case 'warning': return 'bg-amber-500 hover:bg-amber-600';
            case 'error': return 'bg-rose-500 hover:bg-rose-600';
            case 'info': return 'bg-sky-500 hover:bg-sky-600';
            case 'traffic': return 'bg-indigo-500 hover:bg-indigo-600';
            default: return 'bg-slate-500 hover:bg-slate-600';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden font-mono text-sm h-[400px] flex flex-col">
            <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-sky-500/30">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sky-500" />
                    <span className="font-bold text-sky-500 tracking-tight">VICTIM_DEFENSE_NODE_V1</span>
                </div>
                <div className="flex gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 animate-pulse text-sky-500" />
                        MONITORING
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-500/20 bg-[#050b15]/50" ref={scrollRef}>
                <div className="flex flex-col gap-2">
                    {logs.length === 0 && (
                        <div className="text-muted-foreground italic text-center py-10 opacity-50 flex flex-col items-center gap-2">
                            <Activity className="w-8 h-8 opacity-20" />
                            <span>Awaiting victim system telemetry...</span>
                        </div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-right-2 duration-300 border-l-2 border-sky-500/10 pl-2">
                            <span className="text-muted-foreground whitespace-nowrap text-[10px] tabular-nums mt-1 font-mono">
                                {new Date(log.timestamp * 1000).toLocaleTimeString([], { hour12: false })}
                            </span>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-start gap-2">
                                    <Badge variant="secondary" className={`${getBadgeColor(log.type)} text-white border-0 capitalize text-[9px] h-4 px-1.5`}>
                                        {log.type}
                                    </Badge>
                                    <span className={`break-all leading-relaxed ${log.type === 'error' ? 'text-rose-400 font-semibold' : 'text-sky-50/90'}`}>
                                        {log.message}
                                    </span>
                                </div>
                                {log.metrics && Object.keys(log.metrics).length > 0 && (
                                    <div className="bg-sky-500/5 rounded p-2 text-[10px] grid grid-cols-2 gap-x-4 gap-y-1 mt-1 w-fit border border-sky-500/10">
                                        {Object.entries(log.metrics).map(([k, v]) => (
                                            <div key={k} className="flex gap-2">
                                                <span className="text-sky-500/60 font-medium uppercase tracking-tighter">{k}:</span>
                                                <span className="text-sky-300 font-bold">{String(v)}</span>
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
