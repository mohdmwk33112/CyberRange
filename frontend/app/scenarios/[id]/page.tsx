'use client';

import { useState, use, useEffect, useRef } from 'react';
import { useScenario, useScenarioState, useUnlockSimulation, useResetQuestionnaire } from '@/features/scenarios/scenarios.hooks';
import { useAuthStore } from '@/features/auth/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LearningContent } from '@/features/scenarios/components/LearningContent';
import { TerminalQuestionnaire } from '@/features/scenarios/components/TerminalQuestionnaire';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { SimulationConsole } from '@/components/simulation/SimulationConsole';
import { VictimConsole } from '@/components/simulation/VictimConsole';
import { VictimHealthMetrics } from '@/components/simulation/VictimHealthMetrics';
import { VictimImpactChart } from '@/components/simulation/VictimImpactChart';
import { IDSAlerts } from '@/components/simulation/IDSAlerts';
import { IDSStatus } from '@/components/simulation/IDSStatus';
import { TrafficMonitor } from '@/components/simulation/TrafficMonitor';
import { AttackDistribution } from '@/components/simulation/AttackDistribution';
import { KillChainProgress } from '@/components/simulation/KillChainProgress';
import { CredentialBreachStats } from '@/components/simulation/CredentialBreachStats';
import { useToast } from '@/hooks/use-toast';
import { Shield, ChevronLeft, ChevronRight, PlayCircle, Lock, CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';

interface ScenarioDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function ScenarioDetailPage({ params }: ScenarioDetailPageProps) {
    const { id } = use(params);
    const user = useAuthStore((state) => state.user) as any;
    const userId = user?._id || user?.sub || '';
    const { toast } = useToast();

    // Data Fetching
    const { data: scenario, isLoading: loadingScenario } = useScenario(id);
    const { data: state, isLoading: loadingState, refetch: refetchState } = useScenarioState(id, userId);
    const unlockMutation = useUnlockSimulation();
    const resetQuestionnaireMutation = useResetQuestionnaire();

    // UI Local state
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [phase, setPhase] = useState<'learning' | 'questionnaire' | 'simulation' | 'completed'>('learning');
    const [isLaunching, setIsLaunching] = useState(false);

    // Visualization State
    const [logs, setLogs] = useState<any[]>([]);
    const [victimLogs, setVictimLogs] = useState<any[]>([]);
    const [victimHealth, setVictimHealth] = useState<any>(null);
    const [idsAlerts, setIdsAlerts] = useState<any[]>([]);
    const [idsStatus, setIdsStatus] = useState<any>(null);
    const [trafficData, setTrafficData] = useState<any[]>([]);
    const [attackStats, setAttackStats] = useState<any[]>([]); // For pie chart
    const [simulationActive, setSimulationActive] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Sync phase and step based on backend state when it loads
    useEffect(() => {
        if (state) {
            if (state.simulationUnlocked) {
                setPhase('simulation');
            } else if (state.questionnaireCompleted) {
                setPhase('simulation'); // Show simulation UI to attempt unlock
            } else {
                // Determine step from backend status if possible
                // For now, default to step 0 or based on completedSteps
                const step = state.currentStep || 0;
                setCurrentStepIndex(step);
            }
        }
    }, [state]);

    // WebSocket Connection
    useEffect(() => {
        if (!simulationActive || !scenario) return;

        // Connect to WebSocket Gateway (Directly to Microservice on 3001)
        socketRef.current = io('http://localhost:3001/simulation');

        socketRef.current.on('connect', () => {
            console.log('Connected to simulation logs');
            const slug = (scenario as any).slug;
            socketRef.current?.emit('subscribe-logs', { slug });
            socketRef.current?.emit('subscribe-victim-logs', { slug });
        });

        socketRef.current.on('log-update', (log: any) => {
            setLogs(prev => [...prev, { ...log, perspective: 'attacker' }]);
            // ... existing log processing for stats ...
            processLogForStats(log);
        });

        socketRef.current.on('victim-log-update', (log: any) => {
            if (log.type === 'ids-alert' || log.type === 'ids-status') {
                setIdsAlerts(prev => [...prev, log].slice(-20));
            } else {
                setVictimLogs(prev => [...prev, { ...log, perspective: 'victim' }].slice(-100));
            }
        });

        const processLogForStats = (log: any) => {
            // ... existing log parsing logic moved here ...
            let bytes = 0;
            if (log.type === 'traffic' && log.metrics?.bytes) {
                bytes = log.metrics.bytes;
            } else if (typeof log.message === 'string') {
                const ddosMatch = log.message.match(/Requests Sent: (\d+)/);
                if (ddosMatch) {
                    const reqCount = parseInt(ddosMatch[1]);
                    bytes = reqCount * 500;
                }
                const botMatch = log.message.match(/Attempt: .+ \| Status: (\d+)/);
                if (botMatch) bytes = 850;
                if (log.message.includes('Exploit sent')) bytes = 1200;
            }

            if (bytes > 0) {
                setTrafficData(prev => {
                    const newData = [...prev, {
                        timestamp: log.timestamp || Date.now() / 1000,
                        bytes: bytes
                    }];
                    return newData.slice(-30);
                });
            }

            let statName = log.type;
            if (log.type === 'phase') statName = 'Attack Phase';
            if (log.type === 'attack') statName = 'Exploitation';
            if (log.type === 'traffic') statName = 'Network Traffic';

            if (log.type === 'stdout') {
                const msg = log.message;
                if (msg.includes('Requests Sent')) statName = 'HTTP Floods';
                else if (msg.includes('Target is up')) statName = 'Health Checks';
                else if (msg.includes('Simulation completed')) statName = 'System Events';
                else if (msg.includes('Starting DDoS')) statName = 'Initialization';
                else if (msg.includes('Starting Credential Stuffing')) statName = 'Initialization';
                else if (msg.includes('Attempt:')) {
                    if (msg.includes('Status: 200')) statName = 'Successful Logins';
                    else if (msg.includes('Status: 401') || msg.includes('Status: 403')) statName = 'Failed Logins';
                    else if (msg.includes('Status: 500')) statName = 'Server Errors';
                    else statName = 'Login Attempts';
                }
                else statName = 'System Logs';
            }

            setAttackStats(prev => {
                const existing = prev.find(p => p.name === statName);
                if (existing) {
                    return prev.map(p => p.name === statName ? { ...p, value: p.value + 1 } : p);
                }
                return [...prev, { name: statName, value: 1 }];
            });
        };

        // Polling for victim health
        const fetchHealth = async () => {
            try {
                const res = await fetch(`http://localhost:3010/scenarios/${id}/victim-health`);
                if (res.ok) {
                    const data = await res.json();
                    setVictimHealth(data);
                }
            } catch (e) {
                console.error('Failed to fetch victim health', e);
            }
        };

        const fetchIDSStatus = async () => {
            try {
                const res = await fetch(`http://localhost:3010/scenarios/ids/status`);
                if (res.ok) {
                    const data = await res.json();
                    setIdsStatus(data);
                }
            } catch (e) {
                console.error('Failed to fetch IDS status', e);
            }
        };

        fetchHealth();
        fetchIDSStatus();
        const healthInterval = setInterval(() => {
            fetchHealth();
            fetchIDSStatus();
        }, 5000);

        return () => {
            socketRef.current?.disconnect();
            clearInterval(healthInterval);
        };
    }, [simulationActive, scenario, id]);

    const handleQuestionnaireComplete = async (score: number, passed: boolean) => {
        refetchState();
        if (passed) {
            toast({
                title: '🎉 Questionnaire Passed!',
                description: `You scored ${score}%. Simulation phase is now available.`,
            });
            // Auto unlock if possible or set phase to simulation to show unlock button
            await unlockMutation.mutateAsync({ scenarioId: id, userId });
            setPhase('simulation');
        } else {
            toast({
                title: 'Study More',
                description: `You scored ${score}%. You need 90% to unlock the simulation.`,
                variant: 'destructive',
            });
        }
    };

    const handleStopSimulation = async () => {
        setSimulationActive(false);
        setLogs([]);
        setVictimLogs([]);
        setVictimHealth(null);
        setIdsAlerts([]);
        setIdsStatus(null);
        setTrafficData([]);
        setAttackStats([]);
        try {
            await fetch(`http://localhost:3010/scenarios/${id}/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            refetchState();
            toast({
                title: 'Simulation Stopped',
                description: 'The simulation environment has been terminated.',
            });
        } catch (e) {
            console.error('Failed to stop simulation', e);
        }
    };

    const handleStartSimulation = async () => {
        setIsLaunching(true);
        // Optimistically set active to start listening
        setSimulationActive(true);
        try {
            const res = await fetch(`http://localhost:3010/scenarios/${id}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (res.ok) {
                toast({
                    title: '🚀 Simulation Starting',
                    description: 'Your attack environment is being deployed. Logs will appear shortly.',
                });
            } else {
                setSimulationActive(false);
                throw new Error(data.message || 'Failed to start simulation');
            }
        } catch (error: any) {
            setSimulationActive(false);
            toast({
                title: 'Launch Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLaunching(false);
        }
    };

    const handleResetQuestionnaire = async () => {
        try {
            await resetQuestionnaireMutation.mutateAsync({ scenarioId: id, userId });
            setPhase('questionnaire');
            setCurrentStepIndex(0);
            setSimulationActive(false);
            toast({
                title: 'Progress Reset',
                description: 'Questionnaire score has been reset. Simulation is now locked.',
            });
        } catch (error: any) {
            toast({
                title: 'Reset Failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    if (loadingScenario || loadingState) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium">Preparing training environment...</p>
                </div>
            </div>
        );
    }

    if (!scenario) return null;

    const currentStep = scenario.steps[currentStepIndex];

    return (
        <div className="min-h-screen bg-background">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
                <Link className="flex items-center gap-2" href="/scenarios">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Back to Scenarios</span>
                </Link>
                <div className="mx-auto flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-bold hidden sm:inline-block">{scenario.title}</span>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <ModeToggle />
                </div>
            </header>

            <main className="container max-w-5xl mx-auto p-6 md:p-8">
                {/* Progress Stepper - Interactive */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => setPhase('learning')}
                        className={`flex flex-col gap-2 group text-left transition-all outline-none ${phase === 'learning' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                    >
                        <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${phase === 'learning' ? 'bg-primary' : 'bg-primary/40'}`}></div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${phase === 'learning' ? 'text-primary' : 'text-muted-foreground'}`}>01. Learning</span>
                    </button>

                    <button
                        onClick={() => setPhase('questionnaire')}
                        className={`flex flex-col gap-2 group text-left transition-all outline-none ${phase === 'questionnaire' ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                    >
                        <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${phase === 'questionnaire' ? 'bg-primary' : state?.questionnaireCompleted ? 'bg-primary/40' : 'bg-secondary'}`}></div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${phase === 'questionnaire' ? 'text-primary' : 'text-muted-foreground'}`}>02. Questionnaire</span>
                    </button>

                    <button
                        onClick={() => state?.simulationUnlocked && setPhase('simulation')}
                        disabled={!state?.simulationUnlocked}
                        className={`flex flex-col gap-2 group text-left transition-all outline-none ${phase === 'simulation' ? 'opacity-100' : state?.simulationUnlocked ? 'opacity-60 hover:opacity-80 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                    >
                        <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${phase === 'simulation' ? 'bg-primary' : state?.simulationUnlocked ? 'bg-primary/40' : 'bg-secondary'}`}></div>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold uppercase tracking-wider ${phase === 'simulation' ? 'text-primary' : 'text-muted-foreground'}`}>03. Simulation</span>
                            {!state?.simulationUnlocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </div>
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-extrabold tracking-tight">{currentStep?.title || scenario.title}</h2>
                            <p className="text-muted-foreground max-w-2xl">{currentStep?.description || scenario.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {state?.score > 0 && (
                                <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 flex flex-col items-center">
                                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">High Score</span>
                                    <span className="text-xl font-bold">{state.score}%</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Phase Content */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {phase === 'learning' && currentStep?.stepType === 'learning' && (
                            <LearningContent
                                content={currentStep.learningContent}
                                onContinue={() => {
                                    // Move to next step if it exists or switch phase
                                    if (scenario.steps[currentStepIndex + 1]?.stepType === 'questionnaire') {
                                        setCurrentStepIndex(currentStepIndex + 1);
                                        setPhase('questionnaire');
                                    } else {
                                        setPhase('questionnaire');
                                    }
                                }}
                            />
                        )}

                        {phase === 'questionnaire' && currentStep?.stepType === 'questionnaire' && (
                            <TerminalQuestionnaire
                                questions={currentStep.questions}
                                stepOrder={currentStep.stepOrder}
                                scenarioId={id}
                                userId={userId}
                                onComplete={handleQuestionnaireComplete}
                            />
                        )}

                        {phase === 'simulation' && (
                            <div className="space-y-8">
                                {!simulationActive && (
                                    <Card className="border-primary/20 bg-card/40 backdrop-blur-sm overflow-hidden">
                                        <CardHeader className="text-center py-10">
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                                {state?.simulationUnlocked ? (
                                                    <PlayCircle className="h-10 w-10 text-primary" />
                                                ) : (
                                                    <Lock className="h-10 w-10 text-muted-foreground" />
                                                )}
                                            </div>
                                            <CardTitle className="text-2xl font-bold">
                                                {state?.simulationUnlocked ? 'Ready to Deploy' : 'Simulation Locked'}
                                            </CardTitle>
                                            <CardDescription className="max-w-md mx-auto text-base mt-2">
                                                {state?.simulationUnlocked
                                                    ? 'Launch the attack simulation to visualize real-time exploitation data.'
                                                    : 'Complete the questionnaire with >90% score to unlock.'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col items-center pb-10 gap-4">
                                            {state?.simulationUnlocked ? (
                                                <div className="w-full max-w-sm space-y-3">
                                                    <Button
                                                        size="lg"
                                                        className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20"
                                                        onClick={handleStartSimulation}
                                                        disabled={isLaunching}
                                                    >
                                                        {isLaunching ? (
                                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Launching...</>
                                                        ) : (
                                                            <><PlayCircle className="mr-2 h-5 w-5" /> Launch Simulation</>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full text-muted-foreground hover:text-primary"
                                                        onClick={handleResetQuestionnaire}
                                                    >
                                                        Retake Questionnaire to Improve Score
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={() => setPhase('questionnaire')}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    Return to Questionnaire
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {simulationActive && (
                                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-rose-500">Attacker Perspective</h3>
                                                </div>
                                                <SimulationConsole logs={logs} />
                                                <TrafficMonitor data={trafficData} />
                                            </div>
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-sky-500">Victim Perspective</h3>
                                                </div>
                                                <IDSStatus status={idsStatus} />
                                                <VictimHealthMetrics health={victimHealth} />
                                                <IDSAlerts alerts={idsAlerts} />
                                                <VictimConsole logs={victimLogs} />
                                                <VictimImpactChart logs={victimLogs} scenarioSlug={(scenario as any).slug} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-2">
                                                <Card className="bg-card/40 border-border/40 p-6">
                                                    <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-widest">Active Exploitation Strategy</h3>
                                                    {/* Scenario Specific Visualizations */}
                                                    {(scenario as any).slug === 'infiltration' ? (
                                                        <KillChainProgress logs={logs} />
                                                    ) : (scenario as any).slug === 'bot' ? (
                                                        <CredentialBreachStats stats={attackStats} />
                                                    ) : (
                                                        <AttackDistribution data={attackStats.length > 0 ? attackStats : [
                                                            { name: 'Waiting for data...', value: 1 }
                                                        ]} />
                                                    )}
                                                </Card>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="bg-card rounded-lg p-6 border border-border bg-card/40 backdrop-blur-sm">
                                                    <h3 className="text-sm font-bold text-muted-foreground mb-4">Simulation Control</h3>
                                                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-4">
                                                        <span className="relative flex h-3 w-3">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                                        </span>
                                                        <span className="font-mono text-sm font-bold uppercase">Active_Session</span>
                                                    </div>

                                                    <Button
                                                        variant="destructive"
                                                        className="w-full h-12 font-bold shadow-lg shadow-rose-500/10"
                                                        onClick={handleStopSimulation}
                                                    >
                                                        Terminate Simulation
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
