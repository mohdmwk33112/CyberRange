'use client';

import { useState, use, useEffect } from 'react';
import { useScenario, useScenarioState, useUnlockSimulation } from '@/features/scenarios/scenarios.hooks';
import { useAuthStore } from '@/features/auth/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LearningContent } from '@/features/scenarios/components/LearningContent';
import { TerminalQuestionnaire } from '@/features/scenarios/components/TerminalQuestionnaire';
import { useToast } from '@/hooks/use-toast';
import { Shield, ChevronLeft, ChevronRight, PlayCircle, Lock, CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

    // UI Local state
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [phase, setPhase] = useState<'learning' | 'questionnaire' | 'simulation' | 'completed'>('learning');
    const [isLaunching, setIsLaunching] = useState(false);

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

    const handleStartSimulation = async () => {
        setIsLaunching(true);
        try {
            const res = await fetch(`http://localhost:3010/scenarios/${id}/start`, {
                method: 'POST',
            });
            const data = await res.json();
            if (res.ok) {
                toast({
                    title: '🚀 Simulation Starting',
                    description: 'Your attack environment is being deployed. Hang tight!',
                });
            } else {
                throw new Error(data.message || 'Failed to start simulation');
            }
        } catch (error: any) {
            toast({
                title: 'Launch Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLaunching(false);
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
                <div className="ml-auto w-24"></div> {/* Spacer for balance */}
            </header>

            <main className="container max-w-5xl mx-auto p-6 md:p-8">
                {/* Progress Stepper */}
                <div className="grid grid-cols-3 gap-2 mb-8">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${phase === 'learning' ? 'bg-primary' : 'bg-primary/40'}`}></div>
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${phase === 'questionnaire' ? 'bg-primary' : state?.questionnaireCompleted ? 'bg-primary/40' : 'bg-secondary'}`}></div>
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${phase === 'simulation' ? 'bg-primary' : state?.simulationUnlocked ? 'bg-primary/40' : 'bg-secondary'}`}></div>
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
                            <Card className="border-primary/20 bg-card/40 backdrop-blur-sm overflow-hidden">
                                <div className="h-2 bg-primary/20 w-full overflow-hidden">
                                    <div className="h-full bg-primary animate-progress origin-left"></div>
                                </div>
                                <CardHeader className="text-center py-10">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                        {state?.simulationUnlocked ? (
                                            <PlayCircle className="h-10 w-10 text-primary" />
                                        ) : (
                                            <Lock className="h-10 w-10 text-muted-foreground" />
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl font-bold">
                                        {state?.simulationUnlocked ? 'Access Granted' : 'Simulation Locked'}
                                    </CardTitle>
                                    <CardDescription className="max-w-md mx-auto text-base mt-2">
                                        {state?.simulationUnlocked
                                            ? 'You have successfully demonstrated mastery of the required concepts. You can now launch the real-world attack environment.'
                                            : 'Complete the questionnaire with a score of at least 90% to unlock the practical simulation.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center pb-10 gap-4">
                                    {state?.simulationUnlocked ? (
                                        <div className="space-y-6 w-full max-w-sm text-center">
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
                                            <p className="text-xs text-muted-foreground">
                                                By starting the simulation, we will deploy a cluster of containers specifically for your training session.
                                            </p>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            onClick={() => setPhase('questionnaire')}
                                            className="gap-2"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Return to Questionnaire
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
