'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ShieldAlert, ShieldCheck, Users, AlertTriangle } from 'lucide-react';

interface CredentialBreachStatsProps {
    stats: { name: string; value: number }[];
}

export const CredentialBreachStats: React.FC<CredentialBreachStatsProps> = ({ stats }) => {
    const success = stats.find(s => s.name === 'Successful Logins')?.value || 0;
    const failed = stats.find(s => s.name === 'Failed Logins')?.value || 0;
    const serverErrors = stats.find(s => s.name === 'Server Errors')?.value || 0;
    const total = success + failed + serverErrors;

    const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : '0.0';

    return (
        <Card className="bg-card border-border p-4">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Credential Breach Analysis</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex flex-col items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-red-500 mb-2" />
                    <span className="text-2xl font-bold text-red-500">{success}</span>
                    <span className="text-[10px] uppercase text-red-400 font-bold">Compromised</span>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex flex-col items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-500 mb-2" />
                    <span className="text-2xl font-bold text-green-500">{failed}</span>
                    <span className="text-[10px] uppercase text-green-400 font-bold">Deflected</span>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Total Attempts</span>
                    <span className="font-mono font-bold">{total}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Breach Rate</span>
                    <span className={`font-mono font-bold ${Number(successRate) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {successRate}%
                    </span>
                </div>
                {serverErrors > 0 && (
                    <div className="flex justify-between items-center text-xs text-yellow-500">
                        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Server Errors</span>
                        <span className="font-mono font-bold">{serverErrors}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Using leaked database: <span className="font-mono text-primary">passwords.txt</span></span>
                </div>
            </div>
        </Card>
    );
};
