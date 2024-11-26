import { Question } from "@/types/question"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Trash2, Edit } from 'lucide-react'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  question: Question
  showFavoriteButton?: boolean
  showAttemptDate?: boolean
  showActions?: boolean
  onDelete?: () => void
  onEdit?: () => void
}

export function QuestionCard({ 
  question, 
  showFavoriteButton,
  showAttemptDate,
  showActions,
  onDelete,
  onEdit
}: QuestionCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const toggleFavorite = async () => {
    const user = auth.currentUser
    if (!user) return

    const favoriteRef = doc(db, `users/${user.uid}/favorites/${question.id}`)
    
    if (isFavorite) {
      await deleteDoc(favoriteRef)
    } else {
      await setDoc(favoriteRef, {
        questionId: question.id,
        addedAt: new Date()
      })
    }
    
    setIsFavorite(!isFavorite)
  }

  function formatDate(timestamp: { seconds: number; nanoseconds: number }) {
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="bg-card border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-foreground">{question.text}</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-foreground border-border">
                  {question.subject}
                </Badge>
                <Badge variant="outline" className="text-foreground border-border">
                  Grade {question.grade}
                </Badge>
                <Badge variant="outline" className="text-foreground border-border">
                  {question.difficulty}
                </Badge>
              </div>
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-foreground hover:text-foreground/80"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive/80"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border text-foreground",
                  option === question.correctAnswer
                    ? "bg-primary/10 border-primary"
                    : "bg-card border-border"
                )}
              >
                {option}
              </div>
            ))}
          </div>
          {showFavoriteButton && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-foreground hover:text-foreground/80",
                isFavorite && "text-red-500 hover:text-red-500/80"
              )}
              onClick={toggleFavorite}
            >
              <Heart className="h-4 w-4 mr-2" fill={isFavorite ? "currentColor" : "none"} />
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 