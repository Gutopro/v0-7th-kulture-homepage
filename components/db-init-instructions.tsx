"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ExternalLink, Database, RefreshCw } from "lucide-react"

export function DbInitInstructions() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Database Setup Required</CardTitle>
          <CardDescription>
            Your Supabase connection is working, but the database tables need to be created.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Database tables not found
            </h3>
            <p className="text-sm text-muted-foreground">
              Your Supabase project is connected, but the required database tables haven't been created yet. Follow the
              instructions below to set up your database.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Setup Instructions:</h3>
            <ol className="space-y-4 text-sm">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                <div>
                  <p className="font-medium">Go to your Supabase dashboard</p>
                  <p className="text-muted-foreground">Log in to your Supabase account and select your project.</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                <div>
                  <p className="font-medium">Navigate to the SQL Editor</p>
                  <p className="text-muted-foreground">In the left sidebar, click on "SQL Editor".</p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                <div>
                  <p className="font-medium">Copy and run the SQL script</p>
                  <p className="text-muted-foreground">
                    Copy the SQL script from{" "}
                    <code className="text-xs bg-muted-foreground/20 px-1 py-0.5 rounded">
                      scripts/init-supabase-tables.sql
                    </code>{" "}
                    in your project and paste it into the SQL Editor.
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  4
                </span>
                <div>
                  <p className="font-medium">Run the script</p>
                  <p className="text-muted-foreground">
                    Click "Run" to execute the SQL script. This will create all necessary tables and sample data.
                  </p>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                  5
                </span>
                <div>
                  <p className="font-medium">Refresh this page</p>
                  <p className="text-muted-foreground">
                    After running the script, refresh this page to see your products and start using the application.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="w-full sm:w-auto">
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to Supabase Dashboard
            </a>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
