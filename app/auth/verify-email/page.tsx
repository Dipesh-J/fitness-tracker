import Link from "next/link"
import { Mail, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-16 items-center">
        <div className="flex items-center gap-2 font-bold">
          <Dumbbell className="h-6 w-6" />
          <span>FitTrack</span>
        </div>
      </header>
      <main className="container flex-1 flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Verify your email</h1>
            <p className="text-muted-foreground">
              We've sent you an email with a verification link. Please check your inbox and click the
              link to verify your account.
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <Link href="/auth/login">
              <Button className="w-full">Return to login</Button>
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            &copy; {new Date().getFullYear()} FitTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 