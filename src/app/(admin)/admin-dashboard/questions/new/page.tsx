'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

const defaultValues: Partial<QuestionFormValues> = {
  difficulty: "medium",
  status: "draft",
  incorrectAnswers: ["", "", ""],
  subject: "mathematics",
  form: "form1"
}

export default function NewQuestionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues,
  })

  async function onSubmit(data: QuestionFormValues) {
    setSaving(true);
    try {
      // Validate required fields
      if (!data.question || !data.correctAnswer || data.incorrectAnswers.some(answer => !answer)) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create question document
      const questionsRef = collection(db, 'questions');
      const docRef = await addDoc(questionsRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid,
        status: data.status || 'draft'
      });

      await logActivity({
        type: 'question_added',
        description: 'Created a new question',
        userId: auth.currentUser?.uid || '',
        metadata: { questionId: docRef.id }
      });

      toast.success('Question created successfully');
      router.push('/admin-dashboard/questions');
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Failed to create question. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Question</h1>
        <p className="text-muted-foreground">
          Create a new quiz question
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                {saving ? 'Creating...' : 'Create Question'}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
