import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, BookOpen, Brain, Sparkles, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
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

      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <Card className="relative overflow-hidden border-primary/10">
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-6 text-center md:p-8">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="font-heading text-2xl leading-[1.1] sm:text-3xl md:text-4xl">
              Ready to Start Your Journey?
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join thousands of students across Africa who are already improving their knowledge with Brain Quest Africa.
            </p>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              )}
            >
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with ❤️ for African students. 2024 Brain Quest Africa. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/yourusername/brain-quest-africa"
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "text-muted-foreground hover:text-foreground"
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
