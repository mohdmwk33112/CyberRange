"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from './admin.api';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export const AuditLogs = () => {
    const { data: logs, isLoading, error } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: adminApi.getAuditLogs,
    });

    if (isLoading) {
        return (
            <Card className="p-8 flex flex-col items-center justify-center bg-muted/20 border-dashed">
                <Activity className="w-8 h-8 text-primary animate-pulse mb-4" />
                <p className="text-muted-foreground animate-pulse">Loading login activity...</p>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-8 flex flex-col items-center justify-center bg-destructive/5 border-destructive/20">
                <AlertTriangle className="w-8 h-8 text-destructive mb-4" />
                <p className="text-destructive font-medium">Failed to load audit logs</p>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card overflow-hidden">
            <div className="p-6 border-b border-border/50 bg-muted/10">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Security Audit Trail
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Monitoring login attempts and infrastructure access.
                </p>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead>User</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Device/Browser</TableHead>
                            <TableHead>Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs?.map((log: any) => (
                            <TableRow key={log._id} className="hover:bg-muted/20 transition-colors">
                                <TableCell className="font-medium">{log.username}</TableCell>
                                <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}
                                        className={log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}
                                    >
                                        {log.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{log.details}</TableCell>
                                <TableCell className="text-[10px] text-muted-foreground max-w-[150px] truncate" title={log.userAgent}>
                                    {log.userAgent || 'Unknown'}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {(!logs || logs.length === 0) && (
                <div className="p-12 text-center text-muted-foreground">
                    No login activity recorded yet.
                </div>
            )}
        </Card>
    );
};
