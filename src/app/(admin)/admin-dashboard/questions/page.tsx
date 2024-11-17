'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { logActivity } from '@/lib/firebase/activity';
import { auth } from '@/lib/firebase/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  difficulty: string;
  status: 'active' | 'draft';
  createdAt: any;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all'
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  async function fetchQuestions() {
    try {
      const questionsRef = collection(db, 'questions');
      let q = query(questionsRef, orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.difficulty !== 'all') {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }

      const snapshot = await getDocs(q);
      const questionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        question: doc.data().question || 'No question text',
        correctAnswer: doc.data().correctAnswer || '',
        incorrectAnswers: doc.data().incorrectAnswers || [],
        difficulty: doc.data().difficulty || 'medium',
        status: doc.data().status || 'draft'
      })) as Question[];

      // Apply search filter client-side
      const filteredQuestions = searchQuery
        ? questionsList.filter(q =>
            q.question.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : questionsList;

      setQuestions(filteredQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await deleteDoc(doc(db, 'questions', questionId));
      await logActivity({
        type: 'question_deleted',
        description: 'Deleted a question',
        userId: auth.currentUser?.uid || '',
        metadata: { questionId }
      });
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleToggleStatus = async (questionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'draft' : 'active';
      await updateDoc(doc(db, 'questions', questionId), {
        status: newStatus
      });
      await logActivity({
        type: 'question_edited',
        description: `${newStatus === 'active' ? 'Activated' : 'Deactivated'} a question`,
        userId: auth.currentUser?.uid || '',
        metadata: { questionId, newStatus }
      });
      toast.success(`Question ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question status:', error);
      toast.error('Failed to update question status');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedQuestions.length} questions?`)) return;

    try {
      await Promise.all(
        selectedQuestions.map(id => deleteDoc(doc(db, 'questions', id)))
      );
      await logActivity({
        type: 'question_deleted',
        description: `Bulk deleted ${selectedQuestions.length} questions`,
        userId: auth.currentUser?.uid || '',
        metadata: { questionIds: selectedQuestions }
      });
      toast.success('Questions deleted successfully');
      setSelectedQuestions([]);
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting questions:', error);
      toast.error('Failed to delete questions');
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'draft') => {
    try {
      await Promise.all(
        selectedQuestions.map(id =>
          updateDoc(doc(db, 'questions', id), { status: newStatus })
        )
      );
      await logActivity({
        type: 'question_edited',
        description: `Bulk ${newStatus === 'active' ? 'activated' : 'deactivated'} ${selectedQuestions.length} questions`,
        userId: auth.currentUser?.uid || '',
        metadata: { questionIds: selectedQuestions, newStatus }
      });
      toast.success(`Questions ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      setSelectedQuestions([]);
      fetchQuestions();
    } catch (error) {
      console.error('Error updating questions:', error);
      toast.error('Failed to update questions');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Questions Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage quiz questions
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/admin-dashboard/questions/upload">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin-dashboard/questions/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.difficulty}
              onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <Card className="p-4 bg-muted">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              {selectedQuestions.length} question{selectedQuestions.length === 1 ? '' : 's'} selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('active')}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('draft')}
              >
                Deactivate
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Questions Table */}
      <Card>
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedQuestions.length === questions.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedQuestions(questions.map(q => q.id));
                      } else {
                        setSelectedQuestions([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No questions found. Try adjusting your filters or add a new question.
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedQuestions(prev => [...prev, question.id]);
                          } else {
                            setSelectedQuestions(prev => prev.filter(id => id !== question.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="max-w-xl">
                        <p className="truncate">{question.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Answer: {question.correctAnswer}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{question.difficulty}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        question.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {question.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(question.id, question.status)}
                        >
                          {question.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin-dashboard/questions/${question.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
