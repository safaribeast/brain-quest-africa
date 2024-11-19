'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { X, Plus } from 'lucide-react'
import { QuestionList } from "@/components/questions/question-list"
import { QuestionForm } from "@/components/questions/question-form"
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/auth'
import { isAdminEmail } from '@/lib/admin-config'
import { onAuthStateChanged } from 'firebase/auth'

export function AdminPortal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("questions")
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Admin portal - Current user:', user?.email)
      const hasAdminAccess = isAdminEmail(user?.email)
      console.log('Admin portal - Has admin access:', hasAdminAccess)

      try {
        if (hasAdminAccess) {
          await router.push('/admin-dashboard/questions')
        } else {
          await router.push('/dashboard')
        }
      } catch (error) {
        console.error('Navigation error:', error)
      } finally {
        onClose()
      }
    })

    return () => unsubscribe()
  }, [router, onClose])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Admin Portal</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
            {activeTab === "questions" && (
              <Button onClick={() => setShowQuestionForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            )}
          </div>

          <TabsContent value="questions">
            <QuestionList />
          </TabsContent>
        </Tabs>

        {showQuestionForm && (
          <Dialog open={showQuestionForm} onOpenChange={setShowQuestionForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Question</DialogTitle>
              </DialogHeader>
              <QuestionForm onClose={() => setShowQuestionForm(false)} />
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
}