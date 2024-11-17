import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to Brain Quest Africa
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to start your educational journey
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
} 