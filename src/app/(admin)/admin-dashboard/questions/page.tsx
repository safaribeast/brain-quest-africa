'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Plus, Pencil, Trash2, Search, Filter, Eye, EyeOff } from 'lucide-react';
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
  subject: string;
  form: string;
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    form: 'all',
    subject: 'all'
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
      if (filters.form !== 'all') {
        q = query(q, where('form', '==', filters.form));
      }
      if (filters.subject !== 'all') {
        q = query(q, where('subject', '==', filters.subject));
      }

      const snapshot = await getDocs(q);
      const questionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        question: doc.data().question || 'No question text',
        correctAnswer: doc.data().correctAnswer || '',
        incorrectAnswers: doc.data().incorrectAnswers || [],
        difficulty: doc.data().difficulty || 'medium',
        status: doc.data().status || 'draft',
        subject: doc.data().subject || '',
        form: doc.data().form || ''
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Questions</h1>
          <p className="text-sm text-muted-foreground">
            Manage quiz questions
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button asChild variant="outline" className="flex-1 sm:flex-none justify-center" size="sm">
            <Link href="/admin-dashboard/questions/upload">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Upload
            </Link>
          </Button>
          <Button asChild className="flex-1 sm:flex-none justify-center" size="sm">
            <Link href="/admin-dashboard/questions/new">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <Card className="p-3 mb-6">
        <div className="flex flex-col gap-3">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
                size="sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.form}
              onValueChange={(value) => setFilters(prev => ({ ...prev, form: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Forms</SelectItem>
                <SelectItem value="form1">Form 1</SelectItem>
                <SelectItem value="form2">Form 2</SelectItem>
                <SelectItem value="form3">Form 3</SelectItem>
                <SelectItem value="form4">Form 4</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.subject}
              onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="kiswahili">Kiswahili</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="bookkeeping">Bookkeeping</SelectItem>
                <SelectItem value="civics">Civics</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.difficulty}
              onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Difficulty" />
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
        <Card className="p-3 mb-6 bg-muted">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              {selectedQuestions.length} selected
            </p>
            <div className="flex flex-wrap gap-2">
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
      <Card className="border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] pl-3">
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
                  <TableHead className="min-w-[200px]">Question</TableHead>
                  <TableHead className="w-[80px]">Form</TableHead>
                  <TableHead className="w-[100px]">Subject</TableHead>
                  <TableHead className="w-[90px]">Difficulty</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right pr-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      No questions found
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="pl-3">
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
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="truncate text-sm">{question.question}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {question.correctAnswer}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {question.form?.replace('form', 'F') || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {question.subject || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          question.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {question.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggleStatus(question.id, question.status)}
                          >
                            <span className="sr-only">
                              {question.status === 'active' ? 'Deactivate' : 'Activate'}
                            </span>
                            {question.status === 'active' ? 
                              <EyeOff className="h-4 w-4" /> : 
                              <Eye className="h-4 w-4" />
                            }
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                          >
                            <Link href={`/admin-dashboard/questions/${question.id}`}>
                              <span className="sr-only">Edit</span>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <span className="sr-only">Delete</span>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
