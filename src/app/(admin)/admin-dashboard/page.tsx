'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Users, BookOpen, Award, FileSpreadsheet, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Question } from '@/types/question';

interface DashboardStats {
  totalQuestions: number;
  totalUsers: number;
  activeQuestions: number;
  draftQuestions: number;
  recentActivity: any[];
  loading: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    totalUsers: 0,
    activeQuestions: 0,
    draftQuestions: 0,
    recentActivity: [],
    loading: true
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch questions stats
        const questionsRef = collection(db, 'questions');
        const questionsSnap = await getDocs(questionsRef);
        const questions = questionsSnap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data()
        } as Question));
        
        const activeQuestions = questions.filter(q => q.status === 'active').length;
        const draftQuestions = questions.filter(q => q.status === 'draft').length;

        // Fetch users stats
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(usersRef);

        // Fetch recent activity
        const activityRef = collection(db, 'activity');
        const recentActivityQuery = query(
          activityRef,
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const activitySnap = await getDocs(recentActivityQuery);
        const recentActivity = activitySnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setStats({
          totalQuestions: questionsSnap.size,
          totalUsers: usersSnap.size,
          activeQuestions,
          draftQuestions,
          recentActivity,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, description = '', loading }) => (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <>
              <h3 className="text-2xl font-bold">{value}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to Brain Quest Africa admin panel
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/admin-dashboard/questions/new">
            <BookOpen className="w-4 h-4 mr-2" />
            Add Question
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin-dashboard/questions/upload">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Bulk Upload
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          title="Total Questions"
          value={stats.totalQuestions}
          loading={stats.loading}
        />
        <StatCard
          icon={BookOpen}
          title="Active Questions"
          value={stats.activeQuestions}
          description="Questions in use"
          loading={stats.loading}
        />
        <StatCard
          icon={TrendingUp}
          title="Draft Questions"
          value={stats.draftQuestions}
          description="Pending review"
          loading={stats.loading}
        />
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          loading={stats.loading}
        />
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {stats.loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No recent activity</p>
        )}
      </Card>
    </div>
  );
}
