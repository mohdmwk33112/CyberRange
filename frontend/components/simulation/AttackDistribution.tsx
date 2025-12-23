'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AttackDistributionProps {
    data: { name: string; value: number }[];
}

const COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)'
];

export const AttackDistribution: React.FC<AttackDistributionProps> = ({ data }) => {
    return (
        <div className="h-[200px] w-full bg-card rounded-lg p-2 border border-border flex flex-col shadow-sm">
            <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider pl-2">Attack Distribution</h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} style={{ fill: COLORS[index % COLORS.length] }} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                            fontSize: '12px',
                            color: 'var(--card-foreground)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)'
                        }}
                        itemStyle={{ color: 'var(--card-foreground)' }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '10px', color: 'var(--muted-foreground)' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
