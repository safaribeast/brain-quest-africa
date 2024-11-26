'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase/auth"
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
import { useRouter, useSearchParams } from "next/navigation"
import { Link } from "@/components/ui/link"
import { GoogleSignInButton } from "./social-auth-buttons"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export function LoginForm() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      setError("")
      console.log("Attempting login with:", { email: values.email })
      await signInWithEmailAndPassword(auth, values.email, values.password)
      console.log("Login successful")
      router.push(from)
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password')
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later')
      } else if (error.code === 'auth/api-key-not-valid') {
        setError('Authentication service is temporarily unavailable. Please try again later.')
        console.error('Firebase API Key error. Please check Firebase configuration.')
      } else if (error.code === 'auth/invalid-api-key') {
        setError('Authentication service configuration error. Please contact support.')
        console.error('Invalid Firebase API Key. Please check Firebase configuration.')
      } else {
        setError(error.message || 'Failed to sign in')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="email@example.com" 
                    className="h-11" 
                    {...field} 
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    className="h-11"
                    {...field} 
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full h-11 bg-black hover:bg-black/90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleSignInButton />

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold hover:text-primary">
              Sign up
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}