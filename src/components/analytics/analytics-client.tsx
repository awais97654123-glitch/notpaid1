'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { ProductivityStats } from '@/types';

interface AnalyticsClientProps {
  stats: ProductivityStats;
}

const PRIORITY_COLORS = {
  urgent: '#f43f5e',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#94a3b8',
};

export function AnalyticsClient({ stats }: AnalyticsClientProps) {
  const priorityData = [
    { name: 'Urgent', value: stats.by_priority.urgent, color: PRIORITY_COLORS.urgent },
    { name: 'High', value: stats.by_priority.high, color: PRIORITY_COLORS.high },
    { name: 'Medium', value: stats.by_priority.medium, color: PRIORITY_COLORS.medium },
    { name: 'Low', value: stats.by_priority.low, color: PRIORITY_COLORS.low },
  ].filter((p) => p.value > 0);

  const projectData = stats.by_project.map((p) => ({
    name: p.name,
    total: p.total,
    completed: p.completed,
    color: p.color,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-500" />
          Productivity Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics, completion rates, and project performance insights.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-500">Completed Tasks</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.tasks_completed}
          </div>
          <span className="text-[10px] text-slate-400">Total milestones reached</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500">Remaining Tasks</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {stats.tasks_remaining}
          </div>
          <span className="text-[10px] text-slate-400">Active backlog</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500">Overdue Tasks</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {stats.overdue_tasks}
          </div>
          <span className="text-[10px] text-slate-400">Past due date</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs text-slate-500">Notes Documented</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
            {stats.notes_created}
          </div>
          <span className="text-[10px] text-slate-400">Knowledge assets</span>
        </Card>

        <Card className="col-span-2 sm:col-span-1 p-4">
          <span className="text-xs text-slate-500">Completion Velocity</span>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {stats.completion_rate}%
          </div>
          <Progress value={stats.completion_rate} className="h-1.5 mt-2" />
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Productivity Velocity Chart */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Weekly Task Velocity
            </CardTitle>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.weekly_trend}>
                <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Priority Breakdown Pie Chart */}
        <Card className="p-5">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              Tasks by Priority
            </CardTitle>
          </CardHeader>
          <div className="h-64 w-full flex items-center justify-center">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No priority tasks recorded yet</div>
            )}
          </div>
        </Card>

        {/* Project Breakdown Bar Chart */}
        <Card className="col-span-1 lg:col-span-2 p-5">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Tasks by Project
            </CardTitle>
          </CardHeader>
          <div className="h-64 w-full">
            {projectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="total" name="Total Tasks" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No project tasks recorded yet
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
