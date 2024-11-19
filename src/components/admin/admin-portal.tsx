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
import { checkAdminAccess } from '@/lib/session'
import { onAuthStateChanged } from 'firebase/auth'

export function AdminPortal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("questions")
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Admin portal - Current user:', user?.email)
      const hasAdminAccess = checkAdminAccess(user?.email)
      console.log('Admin portal - Has admin access:', hasAdminAccess)

      if (hasAdminAccess) {
        router.push('/admin-dashboard/questions')
      } else {
        router.push('/dashboard')
      }
      onClose()
    })

    return () => unsubscribe()
  }, [router, onClose])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] p-0 gap-0 rounded-none bg-background">
        <div className="flex h-full">
          <div className="flex-1 p-6">
            <DialogHeader>
              <DialogTitle>Admin Portal</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            <Tabs defaultValue={activeTab} className="mt-6" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="mt-6">
                {showQuestionForm ? (
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-card rounded-lg shadow-sm border">
                      <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-semibold text-foreground">Add New Question</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowQuestionForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                        <QuestionForm onClose={() => setShowQuestionForm(false)} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                      <h2 className="text-lg font-semibold text-foreground">Question Management</h2>
                      <Button onClick={() => setShowQuestionForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                    <div 
                      className="flex-1 bg-card rounded-lg shadow-sm overflow-y-auto border" 
                      style={{ maxHeight: 'calc(100vh - 220px)' }}
                    >
                      <div className="p-4">
                        <QuestionList showActions />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">User Management</h2>
                <div className="bg-card rounded-lg shadow-sm p-4 border">
                  <p className="text-muted-foreground">User management features coming soon...</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Admin Settings</h2>
                <div className="bg-card rounded-lg shadow-sm p-4 border">
                  <p className="text-muted-foreground">Admin settings features coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}