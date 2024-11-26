'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
  displayName: z.string().min(2).max(50),
  grade: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  email: z.string().email(),
})

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  useEffect(() => {
    const loadUserProfile = async () => {
      const user = auth.currentUser
      if (!user) return

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        form.reset({
          displayName: data.displayName || "",
          email: data.email,
          grade: data.grade,
          subjects: data.subjects || [],
        })
      }
    }

    loadUserProfile()
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const user = auth.currentUser
      if (!user) return

      await updateDoc(doc(db, "users", user.uid), {
        ...values,
        updatedAt: new Date(),
      })

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error(error)
      form.setError("root", {
        message: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Display Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your display name" 
                  className="bg-[#0F1629] text-gray-200 border-[#1E293B] focus:border-blue-500" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-[#0F1629] text-gray-200 border-[#1E293B] focus:border-blue-500" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Grade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-[#0F1629] text-gray-200 border-[#1E293B] focus:border-blue-500">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#0F1629] border-[#1E293B]">
                  {[7, 8, 9, 10, 11, 12].map((grade) => (
                    <SelectItem 
                      key={grade} 
                      value={grade.toString()}
                      className="text-gray-200 hover:bg-[#1E293B] focus:bg-[#1E293B]"
                    >
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-300"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 