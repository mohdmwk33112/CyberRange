'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AttackDistributionProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ff4d4d'];

export const AttackDistribution: React.FC<AttackDistributionProps> = ({ data }) => {
    return (
        <div className="h-[200px] w-full bg-black/40 rounded-lg p-2 border border-white/10 flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider pl-2">Attack Distribution</h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '10px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
