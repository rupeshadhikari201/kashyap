"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { applicantAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileCheck, Clock, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Analytics {
  total_applicants: number;
  pending_applications: number;
  completed_applications: number;
  this_month: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await applicantAPI.getAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const stats = [
    {
      title: 'Total Applicants',
      value: analytics?.total_applicants || 0,
      icon: Users,
      description: 'All registered applicants',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'This Month',
      value: analytics?.this_month || 0,
      icon: TrendingUp,
      description: 'New applicants this month',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Completed',
      value: analytics?.completed_applications || 0,
      icon: FileCheck,
      description: 'Completed applications',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Pending',
      value: analytics?.pending_applications || 0,
      icon: Clock,
      description: 'Pending review',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.full_name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your applicant management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/dashboard/add-applicant">
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Add New Applicant
            </Button>
          </Link>
          <Link href="/dashboard/applicants">
            <Button variant="outline">
              <FileCheck className="mr-2 h-4 w-4" />
              View All Applicants
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity or Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick guide to using the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              1
            </div>
            <div>
              <h4 className="font-medium">Add Applicants</h4>
              <p className="text-sm text-muted-foreground">
                Use the multi-step form to add student applicants with their personal info, academics, and test scores
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              2
            </div>
            <div>
              <h4 className="font-medium">Manage Applications</h4>
              <p className="text-sm text-muted-foreground">
                View, edit, and delete applicant records as needed. {user?.role === 'admin' ? 'As an admin, you have full access.' : 'As a documentation officer, you can create, update, and read records.'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              3
            </div>
            <div>
              <h4 className="font-medium">Upload Documents</h4>
              <p className="text-sm text-muted-foreground">
                Upload merged PDF documents (max 10MB) for each applicant to keep all records in one place
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}