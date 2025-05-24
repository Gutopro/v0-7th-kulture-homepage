"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EnvErrorProps {
  missingVars: string[]
}

export function EnvError({ missingVars }: EnvErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Configuration Required</CardTitle>
          <CardDescription>
            This application requires environment variables to be configured before it can function properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Missing Environment Variables:</h3>
            <div className="bg-muted p-4 rounded-md">
              <ul className="space-y-1">
                {missingVars.map((envVar) => (
                  <li key={envVar} className="font-mono text-sm text-destructive">
                    {envVar}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Setup Instructions:</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                <span>Create a Supabase project at supabase.com</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                <span>Copy your project URL and anon key from the Supabase dashboard</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                <span>Add these environment variables to your Vercel project:</span>
              </li>
              <li className="ml-8 space-y-1 text-xs font-mono bg-muted p-2 rounded">
                <div>NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  4
                </span>
                <span>Run the database initialization script to create tables</span>
              </li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Supabase
              </a>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
