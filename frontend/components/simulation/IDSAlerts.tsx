'use client';

import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, AlertTriangle, Fingerprint, Zap } from 'lucide-react';

interface IDSAlert {
    type: 'ids-alert' | 'ids-status';
    message: string;
    timestamp: number;
    confidence: number;
    perspective: 'victim';
}

interface IDSAlertsProps {
    alerts: IDSAlert[];
}

export const IDSAlerts: React.FC<IDSAlertsProps> = ({ alerts }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [alerts]);

    const getAlertColor = (message: string) => {
        if (message.includes('DDoS')) return 'border-rose-500/50 bg-rose-500/10 text-rose-400';
        if (message.includes('Bot')) return 'border-amber-500/50 bg-amber-500/10 text-amber-400';
        if (message.includes('Benign')) return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
        return 'border-sky-500/50 bg-sky-500/10 text-sky-400';
    };

    return (
        <div className="bg-slate-950/80 border border-border/50 rounded-lg overflow-hidden flex flex-col h-[250px] shadow-inner">
            <div className="bg-slate-900 px-4 py-2 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Live Intrusion Telemetry</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span className="text-[9px] font-bold text-rose-500 uppercase">Detect_On</span>
                </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-2 scrollbar-thin scrollbar-thumb-slate-800" ref={scrollRef}>
                {alerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 italic opacity-40">
                        <Zap className="w-6 h-6 mb-2" />
                        <span>Awaiting system fingerprinting...</span>
                    </div>
                )}
                {alerts.map((alert, i) => (
                    <div
                        key={i}
                        className={`p-2 border rounded-md animate-in slide-in-from-left-4 duration-300 ${getAlertColor(alert.message)}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] opacity-70">
                                {new Date(alert.timestamp * 1000).toLocaleTimeString([], { hour12: false })}
                            </span>
                            <Badge variant="outline" className="text-[8px] h-3 border-current/30 px-1 py-0 font-bold uppercase">
                                Conf: {(alert.confidence * 100).toFixed(1)}%
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            {alert.type === 'ids-alert' ? (
                                <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                            ) : (
                                <Zap className="w-3 h-3 flex-shrink-0 opacity-50" />
                            )}
                            <span className="font-bold leading-tight">{alert.message}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
