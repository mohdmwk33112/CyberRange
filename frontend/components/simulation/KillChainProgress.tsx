'use client';

import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface KillChainProgressProps {
    logs: any[];
}

export const KillChainProgress: React.FC<KillChainProgressProps> = ({ logs }) => {
    // Determine current phase from logs
    // Look for latest 'phase' log
    const phases = [
        { id: 1, name: 'Reconnaissance', description: 'Scanning target network' },
        { id: 2, name: 'Exploitation', description: 'Sending RCE payload' },
        { id: 3, name: 'Infiltration', description: 'Establishing C2 channel' },
        { id: 4, name: 'Exfiltration', description: 'Stealing sensitive data' }
    ];

    let currentPhaseId = 0;

    // Parse logs to find current phase
    logs.forEach(log => {
        if (log.type === 'phase' && log.metrics?.phase) {
            currentPhaseId = log.metrics.phase;
        }
        // Fallback text parsing
        else if (log.message?.includes('Stage 1')) currentPhaseId = 1; // Now Stage 1 is Recon (Phase 1)
        else if (log.message?.includes('Stage 2')) currentPhaseId = 2; // Now Stage 2 is Exploitation (Phase 2)
        else if (log.message?.includes('Stage 3')) currentPhaseId = 3; // Now Stage 3 is Infiltration (Phase 3)
        else if (log.message?.includes('Stage 4')) currentPhaseId = 4; // Now Stage 4 is Exfiltration (Phase 4)
    });

    // If no phase detected yet but logs exist, assume phase 1
    if (currentPhaseId === 0 && logs.length > 0) currentPhaseId = 1;

    return (
        <Card className="bg-card border-border p-4">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Cyber Kill Chain</h3>
            <div className="relative">
                {phases.map((phase, index) => {
                    const isActive = phase.id === currentPhaseId;
                    const isCompleted = phase.id < currentPhaseId;

                    return (
                        <div key={phase.id} className="flex gap-4 mb-6 last:mb-0 relative z-10">
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                    ${isCompleted ? 'bg-green-500/20 border-green-500 text-green-500' :
                                        isActive ? 'bg-primary/20 border-primary text-primary animate-pulse' :
                                            'bg-card border-muted text-muted-foreground'}`}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{phase.id}</span>}
                                </div>
                                {index < phases.length - 1 && (
                                    <div className={`w-0.5 h-full min-h-[20px] absolute top-8 left-4 -ml-px -z-10
                                        ${isCompleted ? 'bg-green-500/50' : 'bg-border'}`}></div>
                                )}
                            </div>
                            <div className={`flex-1 pt-1 transition-all duration-500 ${isActive ? 'translate-x-1' : ''}`}>
                                <h4 className={`text-sm font-bold ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {phase.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">{phase.description}</p>
                                {isActive && (
                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-primary">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                        IN PROGRESS
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
