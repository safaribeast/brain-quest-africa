'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Users, BookOpen, Award, FileSpreadsheet, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase/config';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where, 
  Timestamp,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Question } from '@/types/question';
import { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DashboardStats {
  totalQuestions: number;
  totalUsers: number;
  activeQuestions: number;
  draftQuestions: number;
  recentQuestions: Question[];
  recentActivity: any[];
  subjectDistribution: Record<string, number>;
  loading: boolean;
  error: string | null;
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  description?: string;
  loading?: boolean;
  trend?: number;
}

export default function AdminDashboardPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    totalUsers: 0,
    activeQuestions: 0,
    draftQuestions: 0,
    recentQuestions: [],
    recentActivity: [],
    subjectDistribution: {},
    loading: true,
    error: null
  });

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    let unsubscribeQuestions: () => void;
    let unsubscribeUsers: () => void;
    let unsubscribeActivity: () => void;

    async function setupListeners() {
      // We know user is defined here because of the check above
      const currentUser = user;

      try {
        // Check if user is admin
        if (!currentUser.email) {
          console.error('No user email found');
          toast.error('User email not found');
          router.push('/dashboard');
          return;
        }

        const isAdminEmail = currentUser.email === 'safaribeast01@gmail.com';
        const userRef = collection(db, 'users');
        const q = query(userRef, where('email', '==', currentUser.email));
        const userSnap = await getDocs(q);
        
        const isAdminInDB = !userSnap.empty && userSnap.docs[0].data()?.isAdmin === true;
        
        if (!isAdminEmail && !isAdminInDB) {
          console.error('User is not an admin');
          toast.error('Access denied. Admin privileges required.');
          router.push('/dashboard');
          return;
        }

        // If user is admin by email but not in DB, add them as admin
        if (isAdminEmail && !isAdminInDB) {
          try {
            await setDoc(doc(db, 'users', currentUser.uid), {
              email: currentUser.email,
              isAdmin: true,
              name: currentUser.displayName || 'Admin User',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (error) {
            console.error('Error setting admin status:', error);
          }
        }

        // Set up real-time listeners for questions
        const questionsRef = collection(db, 'questions');
        const questionsQuery = query(questionsRef, orderBy('createdAt', 'desc'));
        
        unsubscribeQuestions = onSnapshot(questionsQuery, 
          (snapshot) => {
            const questions = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Question));

            const activeQuestions = questions.filter(q => q.status === 'active').length;
            const draftQuestions = questions.filter(q => q.status === 'draft').length;
            const recentQuestions = questions.slice(0, 5);

            const subjectDistribution = questions.reduce((acc, q) => {
              const subject = q.subject || 'Uncategorized';
              acc[subject] = (acc[subject] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            setStats(prev => ({
              ...prev,
              totalQuestions: questions.length,
              activeQuestions,
              draftQuestions,
              recentQuestions,
              subjectDistribution,
              loading: false,
              error: null
            }));
          },
          (error) => {
            console.error('Questions listener error:', error);
            toast.error('Error loading questions data');
            setStats(prev => ({ ...prev, loading: false, error: 'Error loading questions' }));
          }
        );

        // Set up real-time listener for users
        const usersRef = collection(db, 'users');
        unsubscribeUsers = onSnapshot(usersRef, 
          (snapshot) => {
            setStats(prev => ({
              ...prev,
              totalUsers: snapshot.size,
              error: null
            }));
          },
          (error) => {
            console.error('Users listener error:', error);
            toast.error('Error loading users data');
          }
        );

        // Set up real-time listener for activity
        const activityRef = collection(db, 'activity');
        const activityQuery = query(activityRef, orderBy('timestamp', 'desc'), limit(5));
        unsubscribeActivity = onSnapshot(activityQuery, 
          (snapshot) => {
            const activities = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));

            setStats(prev => ({
              ...prev,
              recentActivity: activities,
              loading: false,
              error: null
            }));
          },
          (error) => {
            console.error('Activity listener error:', error);
            toast.error('Error loading activity data');
          }
        );
      } catch (error) {
        console.error('Setup error:', error);
        setStats(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Error setting up dashboard' 
        }));
        toast.error('Error setting up dashboard');
      }
    }

    if (user) {
      setupListeners();
    }

    // Cleanup listeners
    return () => {
      if (unsubscribeQuestions) unsubscribeQuestions();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeActivity) unsubscribeActivity();
    };
  }, [user, loading, router]);

  // Show loading state
  if (loading || stats.loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (stats.error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-[var(--game-text)]">Error Loading Dashboard</h2>
        <p className="text-[var(--game-text-muted)] mt-2">{stats.error}</p>
      </div>
    );
  }

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    description = '', 
    loading,
    trend 
  }: StatCardProps) => (
    <Card className="bg-[var(--game-surface)] border-[var(--game-border)] p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[var(--game-primary)]/10 rounded-lg">
          <Icon className="w-8 h-8 text-[var(--game-primary)]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[var(--game-text-muted)]">{title}</h3>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-[var(--game-text)]">{value}</p>
              {trend !== undefined && (
                <span className={`ml-2 text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </span>
              )}
            </div>
          )}
          {description && (
            <p className="mt-1 text-sm text-[var(--game-text-muted)]">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-8 h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--game-text)]">Dashboard Overview</h1>
        <Link href="/admin-dashboard/questions/new">
          <Button className="bg-[var(--game-primary)] hover:bg-[var(--game-primary-dark)] text-white">
            Add New Question
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          title="Total Questions"
          value={stats.totalQuestions}
          loading={stats.loading}
        />
        <StatCard
          icon={CheckCircle}
          title="Active Questions"
          value={stats.activeQuestions}
          loading={stats.loading}
        />
        <StatCard
          icon={XCircle}
          title="Draft Questions"
          value={stats.draftQuestions}
          loading={stats.loading}
        />
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          loading={stats.loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-[var(--game-surface)] border-[var(--game-border)] p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--game-text)]">Recent Questions</h2>
          <div className="space-y-4">
            {stats.loading ? (
              Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))
            ) : (
              stats.recentQuestions.map((question) => (
                <div key={question.id} className="flex items-center justify-between p-3 bg-[var(--game-surface-light)] rounded-lg">
                  <div>
                    <p className="font-medium text-[var(--game-text)]">{question.question}</p>
                    <p className="text-sm text-[var(--game-text-muted)]">{question.subject} - {question.topic}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    question.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {question.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="bg-[var(--game-surface)] border-[var(--game-border)] p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--game-text)]">Subject Distribution</h2>
          <div className="space-y-4">
            {stats.loading ? (
              Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))
            ) : (
              Object.entries(stats.subjectDistribution).map(([subject, count]) => (
                <div key={subject} className="flex items-center justify-between">
                  <span className="font-medium text-[var(--game-text)]">{subject}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-[var(--game-surface-light)] rounded-full h-2.5">
                      <div
                        className="bg-[var(--game-primary)] h-2.5 rounded-full"
                        style={{
                          width: `${(count / stats.totalQuestions) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-[var(--game-text)]">{count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="bg-[var(--game-surface)] border-[var(--game-border)] p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4 text-[var(--game-text)]">Recent Activity</h2>
        <div className="space-y-4">
          {stats.loading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))
          ) : (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-[var(--game-surface-light)] rounded-lg">
                <Activity className="w-5 h-5 text-[var(--game-primary)]" />
                <div>
                  <p className="font-medium text-[var(--game-text)]">{activity.description}</p>
                  <p className="text-sm text-[var(--game-text-muted)]">
                    {new Date(activity.timestamp?.toDate()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
