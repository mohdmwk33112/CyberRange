'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, Wifi, WifiOff, Activity } from 'lucide-react';

interface IDSStatusProps {
    status: any;
}

export const IDSStatus: React.FC<IDSStatusProps> = ({ status }) => {
    const isOnline = status && status.status === 'ready';
    const isLoading = !status;

    return (
        <Card className={`bg-slate-900 border-border/40 overflow-hidden ${isOnline ? 'border-l-emerald-500 border-l-2' : 'border-l-rose-500 border-l-2'}`}>
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {isOnline ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mb-1">IDS Engine Status</div>
                            <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold ${isOnline ? 'text-slate-200' : 'text-slate-400'}`}>
                                    {isOnline ? 'Federated Hub: ACTIVE' : 'Detection Offline'}
                                </span>
                                {isOnline ? (
                                    <Badge variant="outline" className="h-4 text-[8px] border-emerald-500/30 text-emerald-500 py-0 flex gap-1">
                                        <Wifi className="w-2 h-2" /> SYNCED
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="h-4 text-[8px] border-rose-500/30 text-rose-500 py-0 flex gap-1">
                                        <WifiOff className="w-2 h-2" /> DISCONNECTED
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Architecture</div>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                            <Activity className="w-3 h-3 text-sky-500" />
                            <span>XGBoost 79f</span>
                        </div>
                    </div>
                </div>

                {!isOnline && !isLoading && (
                    <div className="mt-2 text-[10px] text-rose-400/70 italic px-1">
                        * IDS server is not responding. Prediction features are disabled.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
