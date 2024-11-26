'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BookOpen, Users, CheckCircle, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { Question } from '@/types/questions';

export default function AdminDashboardPage() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    activeQuestions: 0,
    draftQuestions: 0,
    recentQuestions: [] as Question[],
    subjectDistribution: {} as Record<string, number>,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const questionsRef = collection(db, 'questions');
        const questionsSnapshot = await getDocs(questionsRef);
        const questions = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Question[];

        const activeQuestions = questions.filter(q => q.status === 'active').length;
        const draftQuestions = questions.filter(q => q.status === 'draft').length;
        const subjectDistribution = questions.reduce((acc, q) => {
          const subject = q.subject || 'Uncategorized';
          acc[subject] = (acc[subject] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        setStats(prev => ({
          ...prev,
          totalQuestions: questions.length,
          totalUsers: usersSnapshot.size,
          activeQuestions,
          draftQuestions,
          recentQuestions: questions.slice(0, 5),
          subjectDistribution,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, error: 'Failed to load stats', loading: false }));
      }
    };

    fetchStats();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8 p-6 bg-gray-900 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Manage your quiz platform and monitor activity.
          </p>
        </div>
        <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/admin-dashboard/questions/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Question
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-800 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BookOpen className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.loading ? <Skeleton className="h-8 w-20" /> : stats.totalQuestions}</div>
            <p className="text-xs text-gray-400">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.loading ? <Skeleton className="h-8 w-20" /> : stats.totalUsers}</div>
            <p className="text-xs text-gray-400">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Questions</CardTitle>
            <CheckCircle className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.loading ? <Skeleton className="h-8 w-20" /> : stats.activeQuestions}</div>
            <p className="text-xs text-gray-400">
              {Math.round((stats.activeQuestions / stats.totalQuestions) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Questions</CardTitle>
            <FileText className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.loading ? <Skeleton className="h-8 w-20" /> : stats.draftQuestions}</div>
            <p className="text-xs text-gray-400">
              {Math.round((stats.draftQuestions / stats.totalQuestions) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-gray-800 border-none shadow-lg">
          <CardHeader>
            <CardTitle>Recent Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentQuestions.map((question) => (
                  <div key={question.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{question.question}</p>
                      <p className="text-sm text-gray-400">
                        {question.subject} - {question.topic}
                      </p>
                    </div>
                    <Badge variant={question.status === 'active' ? 'default' : 'secondary'}>
                      {question.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-gray-800 border-none shadow-lg">
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.subjectDistribution).map(([subject, count]) => (
                  <div key={subject} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">{subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{
                            width: `${(count / stats.totalQuestions) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
