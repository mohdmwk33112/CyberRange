'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Lightbulb, ExternalLink, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LearningContentProps {
    content: {
        objectives: string[];
        theory?: string;
        examples: {
            title: string;
            description: string;
            command: string;
            output: string;
        }[];
        keyPoints: string[];
        resources: {
            title: string;
            url: string;
        }[];
    };
    onContinue: () => void;
}

export function LearningContent({ content, onContinue }: LearningContentProps) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-6">
            {/* Objectives */}
            <Card className="border-border/40 bg-card/50 backdrop-blur">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle>Learning Objectives</CardTitle>
                    </div>
                    <CardDescription>What you'll learn in this module</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {content.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                <span>{objective}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Theory */}
            {content.theory && (
                <Card className="border-border/40 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <CardTitle>Theory & Concepts</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{content.theory}</ReactMarkdown>
                    </CardContent>
                </Card>
            )}

            {/* Examples */}
            {content.examples.length > 0 && (
                <Card className="border-border/40 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Command Examples</CardTitle>
                        <CardDescription>Study these examples before the practice phase</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {content.examples.map((example, index) => (
                            <div key={index} className="border border-border/40 rounded-lg p-4 bg-background/50">
                                <h4 className="font-semibold mb-1">{example.title}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{example.description}</p>

                                {/* Command */}
                                <div className="bg-black/90 rounded-md p-3 mb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-green-400">$ Command</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => copyToClipboard(example.command)}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                    <code className="text-green-400 font-mono text-sm">{example.command}</code>
                                </div>

                                {/* Output */}
                                <div className="bg-black/90 rounded-md p-3">
                                    <span className="text-xs text-blue-400 block mb-1">Output:</span>
                                    <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap">{example.output}</pre>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Key Points */}
            {content.keyPoints.length > 0 && (
                <Card className="border-border/40 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            <CardTitle>Key Takeaways</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {content.keyPoints.map((point, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <span className="text-sm">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Resources */}
            {content.resources.length > 0 && (
                <Card className="border-border/40 bg-card/50 backdrop-blur">
                    <CardHeader>
                        <CardTitle>Additional Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {content.resources.map((resource, index) => (
                                <a
                                    key={index}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    {resource.title}
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Continue Button */}
            <div className="flex justify-center pt-4">
                <Button size="lg" onClick={onContinue} className="gap-2">
                    Continue to Practice
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
