'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { doc, collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const formSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters"),
  options: z.array(z.string()).min(2, "At least 2 options required").max(4, "Maximum 4 options allowed"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().optional(),
  subject: z.enum(["mathematics", "physics", "chemistry", "geography", "biology", "history", "english", "kiswahili", "commerce", "bookkeeping", "civics"]),
  grade: z.enum(["form1", "form2", "form3", "form4"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
})

interface QuestionFormProps {
  onClose?: () => void
}

export function QuestionForm({ onClose }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      subject: "mathematics",
      grade: "form1",
      difficulty: "easy",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      if (!values.options.includes(values.correctAnswer)) {
        form.setError("correctAnswer", {
          message: "Correct answer must be one of the options"
        })
        return
      }

      const questionData = {
        ...values,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'questions'), questionData)
      toast.success('Question added successfully')
      form.reset()
      onClose?.()

    } catch (error) {
      console.error("Error adding question:", error)
      toast.error("Failed to add question. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Question Text</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter the question text" 
                  className="bg-background text-foreground border-border min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          {[0, 1, 2, 3].map((index) => (
            <FormField
              key={index}
              control={form.control}
              name={`options.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Option {index + 1}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={`Enter option ${index + 1}`} 
                      className="bg-background text-foreground border-border"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <FormField
          control={form.control}
          name="correctAnswer"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Correct Answer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select the correct answer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background border-border">
                  {form.watch('options').map((option, index) => (
                    option && (
                      <SelectItem 
                        key={index} 
                        value={option}
                        className="text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        {option}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Subject</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background border-border">
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
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Grade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select a grade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background border-border">
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

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Difficulty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background border-border">
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
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Explanation (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter an explanation for the correct answer" 
                  className="bg-background text-foreground border-border min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Adding Question..." : "Add Question"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 