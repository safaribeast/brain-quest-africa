'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { logActivity } from '@/lib/firebase/activity';
import { auth } from '@/lib/firebase/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const questionFormSchema = z.object({
  question: z.string().min(10, {
    message: "Question must be at least 10 characters.",
  }),
  correctAnswer: z.string().min(1, {
    message: "Correct answer is required.",
  }),
  incorrectAnswers: z.array(z.string()).length(3, {
    message: "Exactly 3 incorrect answers are required.",
  }),
  difficulty: z.enum(["easy", "medium", "hard"], {
    required_error: "Please select a difficulty level.",
  }),
  status: z.enum(["active", "draft"], {
    required_error: "Please select a status.",
  }),
  subject: z.enum(["mathematics", "physics", "chemistry", "geography", "biology", "history", "english", "kiswahili", "commerce", "bookkeeping", "civics"], {
    required_error: "Please select a subject.",
  }),
  form: z.enum(["form1", "form2", "form3", "form4"], {
    required_error: "Please select a form.",
  }),
  explanation: z.string().optional(),
})

type QuestionFormValues = z.infer<typeof questionFormSchema>

export default function EditQuestionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question: "",
      correctAnswer: "",
      incorrectAnswers: ["", "", ""],
      difficulty: "medium",
      status: "draft",
      subject: "mathematics",
      form: "form1",
      explanation: "",
    },
  })

  useEffect(() => {
    fetchQuestion();
  }, [params.id]);

  async function fetchQuestion() {
    try {
      const docRef = doc(db, 'questions', params.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        toast.error('Question not found');
        router.push('/admin-dashboard/questions');
        return;
      }

      const data = docSnap.data();
      form.reset({
        question: data.question || "",
        correctAnswer: data.correctAnswer || "",
        incorrectAnswers: data.incorrectAnswers || ["", "", ""],
        difficulty: data.difficulty || "medium",
        status: data.status || "draft",
        subject: data.subject || "mathematics",
        form: data.form || "form1",
        explanation: data.explanation || "",
      });
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: QuestionFormValues) {
    setSaving(true);
    try {
      const docRef = doc(db, 'questions', params.id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      });

      await logActivity({
        type: 'question_edited',
        description: 'Updated a question',
        userId: auth.currentUser?.uid || '',
        metadata: { questionId: params.id }
      });

      toast.success('Question updated successfully');
      router.push('/admin-dashboard/questions');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Question</h1>
        <p className="text-muted-foreground">
          Update the question details below
        </p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question here..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a clear and concise question.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="correctAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the correct answer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {[0, 1, 2].map((index) => (
              <FormField
                key={index}
                control={form.control}
                name={`incorrectAnswers.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incorrect Answer {index + 1}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={`Enter incorrect answer ${index + 1}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="kiswahili">Kiswahili</SelectItem>
                        <SelectItem value="commerce">Commerce</SelectItem>
                        <SelectItem value="bookkeeping">Bookkeeping</SelectItem>
                        <SelectItem value="civics">Civics</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select form" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="form1">Form 1</SelectItem>
                        <SelectItem value="form2">Form 2</SelectItem>
                        <SelectItem value="form3">Form 3</SelectItem>
                        <SelectItem value="form4">Form 4</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explanation (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter an explanation for the correct answer..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide an explanation for why the correct answer is right.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin-dashboard/questions')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
