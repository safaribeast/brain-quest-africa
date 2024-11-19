'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionForm } from "@/components/questions/question-form"
import { Button } from "@/components/ui/button"
import { X, Plus } from 'lucide-react'
import { QuestionList } from "@/components/questions/question-list"
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/auth'
import { isAdminEmail } from '@/lib/admin-config'

export function AdminPortal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("questions")
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if the current user is the admin
    const user = auth.currentUser
    if (isAdminEmail(user?.email)) {
      router.push('/admin-dashboard/questions')
    } else {
      router.push('/dashboard')
    }
    onClose()
  }, [router, onClose])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] p-0 gap-0 rounded-none bg-background">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-4 py-4 border-b shrink-0 bg-background sm:px-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-foreground">Admin Portal</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs
            defaultValue="questions"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col h-full"
          >
            <div className="border-b px-4 sm:px-6 shrink-0 bg-background">
              <TabsList className="h-12">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden bg-background/50">
              <TabsContent 
                value="questions" 
                className="h-full p-4 sm:p-6 mt-0"
              >
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

              <TabsContent 
                value="users" 
                className="h-full p-4 sm:p-6 mt-0 overflow-y-auto"
              >
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">User Management</h2>
                  <div className="bg-card rounded-lg shadow-sm p-4 border">
                    <p className="text-muted-foreground">User management features coming soon...</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent 
                value="settings" 
                className="h-full p-4 sm:p-6 mt-0 overflow-y-auto"
              >
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Admin Settings</h2>
                  <div className="bg-card rounded-lg shadow-sm p-4 border">
                    <p className="text-muted-foreground">Admin settings features coming soon...</p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
} 