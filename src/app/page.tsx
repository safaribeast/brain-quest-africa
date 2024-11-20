import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, BookOpen, Brain, Sparkles, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Component() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold">Brain Quest Africa</span>
            </Link>
          </div>
          {/* Middle Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Features
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-foreground"
              )}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              )}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
            🌍 Welcome to the future of African education
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Brain Quest{" "}
            <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Africa
            </span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Embark on an educational journey through Africa. Test your knowledge, learn fascinating facts, 
            and challenge yourself with our engaging quiz platform designed for African students.
          </p>
          <div>
            <Link 
              href="/marathon" 
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              )}
            >
              Start Marathon <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-24" id="features">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Discover why students across Africa choose Brain Quest Africa for their learning journey
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card className="relative overflow-hidden border-primary/10 transition-colors hover:border-primary/30">
            <CardContent className="flex h-[180px] flex-col justify-between p-6">
              <BookOpen className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Interactive Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Engage with dynamic quizzes and challenges that make learning fun and effective
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-primary/10 transition-colors hover:border-primary/30">
            <CardContent className="flex h-[180px] flex-col justify-between p-6">
              <Brain className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">African Context</h3>
                <p className="text-sm text-muted-foreground">
                  Content tailored specifically for African students and curriculum
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-primary/10 transition-colors hover:border-primary/30">
            <CardContent className="flex h-[180px] flex-col justify-between p-6">
              <Sparkles className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Progress Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your learning journey and track your improvement over time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="relative overflow-hidden rounded-lg bg-slate-900 px-6 py-16 sm:px-12 sm:py-24 md:p-20">
          <div className="absolute top-4 right-8">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-12 w-12 text-yellow-500 animate-pulse"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Join thousands of students across Africa who are already improving their knowledge with Brain Quest Africa
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-slate-900 hover:bg-gray-100"
                )}
              >
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-48 -left-48 opacity-50">
            <svg
              viewBox="0 0 558 558"
              width="558"
              height="558"
              fill="none"
              aria-hidden="true"
              className="animate-spin-slow"
            >
              <defs>
                <linearGradient
                  id="gradient"
                  x1="79"
                  y1="16"
                  x2="105"
                  y2="237"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                opacity=".2"
                d="M1 279C1 125.465 125.465 1 279 1s278 124.465 278 278-124.465 278-278 278S1 432.535 1 279Z"
                stroke="#fff"
              />
              <path
                d="M1 279C1 125.465 125.465 1 279 1"
                stroke="url(#gradient)"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with ❤️ for African students. &copy; 2024 Brain Quest Africa. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground"
              )}
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}