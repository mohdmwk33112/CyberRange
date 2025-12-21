'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Terminal, HelpCircle, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
    questionOrder: number;
    questionText: string;
    expectedCommand: string;
    validationType: string;
    points: number;
    hints: string[];
    successMessage?: string;
    errorMessage?: string;
    explanation?: string;
}

interface TerminalQuestionnaireProps {
    questions: Question[];
    stepOrder: number;
    scenarioId: string;
    userId: string;
    onComplete: (score: number, passed: boolean) => void;
}

interface QuestionResult {
    questionOrder: number;
    answer: string;
    correct: boolean;
    points: number;
}

export function TerminalQuestionnaire({
    questions,
    stepOrder,
    scenarioId,
    userId,
    onComplete,
}: TerminalQuestionnaireProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [commandHistory, setCommandHistory] = useState<{ command: string; output: string; success: boolean }[]>([]);
    const [results, setResults] = useState<QuestionResult[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [hintIndex, setHintIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const currentQuestion = questions[currentQuestionIndex];
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = results.reduce((sum, r) => sum + r.points, 0);

    const validateAnswer = async () => {
        if (!userAnswer.trim()) {
            toast({
                title: 'Empty command',
                description: 'Please enter a command',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/scenarios/${scenarioId}/validate-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    stepOrder,
                    questionOrder: currentQuestion.questionOrder,
                    answer: userAnswer,
                }),
            });

            const data = await response.json();

            // Add to history
            setCommandHistory(prev => [
                ...prev,
                {
                    command: userAnswer,
                    output: data.correct ? data.message : data.message,
                    success: data.correct,
                },
            ]);

            // Add to results
            setResults(prev => [
                ...prev,
                {
                    questionOrder: currentQuestion.questionOrder,
                    answer: userAnswer,
                    correct: data.correct,
                    points: data.points,
                },
            ]);

            if (data.correct) {
                toast({
                    title: '✓ Correct!',
                    description: data.message,
                });

                // Move to next question or complete
                if (currentQuestionIndex < questions.length - 1) {
                    setTimeout(() => {
                        setCurrentQuestionIndex(prev => prev + 1);
                        setUserAnswer('');
                        setShowHint(false);
                        setHintIndex(0);
                    }, 1500);
                } else {
                    // All questions completed
                    const finalScore = ((earnedPoints + data.points) / totalPoints) * 100;
                    setTimeout(() => {
                        onComplete(Math.round(finalScore), finalScore >= 90);
                    }, 1500);
                }
            } else {
                toast({
                    title: '✗ Incorrect',
                    description: data.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to validate answer',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isSubmitting) {
            validateAnswer();
        }
    };

    const revealHint = () => {
        if (hintIndex < currentQuestion.hints.length) {
            setShowHint(true);
            setHintIndex(prev => prev + 1);
        }
    };

    return (
        <div className="space-y-4">
            {/* Score Header */}
            <Card className="border-border/40 bg-card/50 backdrop-blur">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            <CardTitle>Progress</CardTitle>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{earnedPoints}/{totalPoints}</div>
                            <div className="text-xs text-muted-foreground">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Terminal Interface */}
            <Card className="border-border/40 bg-black/90 backdrop-blur">
                <CardHeader className="border-b border-green-500/20">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-mono text-sm">user@cyberrange:~$</span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 font-mono text-sm">
                    {/* Command History */}
                    <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                        {commandHistory.map((entry, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-400">$</span>
                                    <span className="text-gray-300">{entry.command}</span>
                                    {entry.success ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-400" />
                                    )}
                                </div>
                                <div className={entry.success ? 'text-green-300' : 'text-red-300'}>
                                    {entry.output}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Current Question */}
                    <div className="mb-4">
                        <div className="text-blue-400 mb-2">
                            Task: {currentQuestion.questionText}
                        </div>
                        <div className="text-yellow-400 text-xs">
                            Points: {currentQuestion.points}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">$</span>
                        <Input
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your command here..."
                            className="bg-transparent border-none text-green-400 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>

                    {/* Hint */}
                    {showHint && hintIndex > 0 && (
                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-300 text-xs">
                            💡 Hint: {currentQuestion.hints[hintIndex - 1]}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    onClick={validateAnswer}
                    disabled={isSubmitting || !userAnswer.trim()}
                    className="flex-1"
                >
                    {isSubmitting ? 'Validating...' : 'Submit Command'}
                </Button>
                <Button
                    variant="outline"
                    onClick={revealHint}
                    disabled={hintIndex >= currentQuestion.hints.length}
                    className="gap-2"
                >
                    <HelpCircle className="h-4 w-4" />
                    Hint ({hintIndex}/{currentQuestion.hints.length})
                </Button>
            </div>
        </div>
    );
}
