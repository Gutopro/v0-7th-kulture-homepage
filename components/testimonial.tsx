import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TestimonialProps {
  quote: string
  author: string
  role?: string
  avatarUrl?: string
}

export function Testimonial({ quote, author, role, avatarUrl }: TestimonialProps) {
  const initials = author
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <div className="absolute -top-2 -left-2 text-4xl text-primary opacity-20">"</div>
            <p className="text-muted-foreground relative z-10">{quote}</p>
            <div className="absolute -bottom-4 -right-2 text-4xl text-primary opacity-20">"</div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Avatar>
              <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={author} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{author}</p>
              {role && <p className="text-sm text-muted-foreground">{role}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
