import { useState } from 'react';
import { toast } from 'sonner';
import { doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface BulkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuestions: string[];
  onSuccess: () => void;
}

export function BulkEditDialog({
  isOpen,
  onClose,
  selectedQuestions,
  onSuccess,
}: BulkEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [difficulty, setDifficulty] = useState<string>("no_change");
  const [status, setStatus] = useState<string>("no_change");
  const [form, setForm] = useState<string>("no_change");
  const [subject, setSubject] = useState<string>("no_change");

  const getUpdateCount = () => {
    let count = 0;
    if (difficulty !== "no_change") count++;
    if (status !== "no_change") count++;
    if (form !== "no_change") count++;
    if (subject !== "no_change") count++;
    return count;
  };

  const handleSubmit = async () => {
    if (getUpdateCount() === 0) {
      toast.error('Please select at least one field to update');
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      const batch = writeBatch(db);
      const updates: Record<string, any> = {};
      if (difficulty !== "no_change") updates.difficulty = difficulty;
      if (status !== "no_change") updates.status = status;
      if (form !== "no_change") updates.form = form;
      if (subject !== "no_change") updates.subject = subject;
      updates.updatedAt = new Date();

      // Show progress during updates
      let processed = 0;
      selectedQuestions.forEach(questionId => {
        const questionRef = doc(db, 'questions', questionId);
        batch.update(questionRef, updates);
        processed++;
        setProgress((processed / selectedQuestions.length) * 100);
      });

      await batch.commit();
      toast.success(`Successfully updated ${selectedQuestions.length} questions`, {
        duration: 3000,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating questions:', error);
      toast.error('Failed to update questions');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] gap-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            Bulk Edit Questions
            <Badge variant="secondary" className="ml-2 text-base">
              {selectedQuestions.length} Selected
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-base">
            Edit multiple questions at once. Only the fields you change will be updated.
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-muted/50 p-6 border-2">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <AlertCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="font-semibold text-lg">Update Summary</h4>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You are about to update {selectedQuestions.length} questions.
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium">Fields to update:</span>
                  {getUpdateCount() === 0 ? (
                    <span className="text-yellow-600 font-medium">None selected</span>
                  ) : (
                    <>
                      {difficulty !== "no_change" && (
                        <Badge variant="outline" className="bg-primary/10">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Difficulty
                        </Badge>
                      )}
                      {status !== "no_change" && (
                        <Badge variant="outline" className="bg-primary/10">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Status
                        </Badge>
                      )}
                      {form !== "no_change" && (
                        <Badge variant="outline" className="bg-primary/10">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Form
                        </Badge>
                      )}
                      {subject !== "no_change" && (
                        <Badge variant="outline" className="bg-primary/10">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Subject
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="text-sm font-medium flex items-center justify-between">
              Difficulty
              <AnimatePresence>
                {difficulty !== "no_change" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="secondary" className="bg-primary/10">Will Update</Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_change">No change</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="text-sm font-medium flex items-center justify-between">
              Status
              <AnimatePresence>
                {status !== "no_change" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="secondary" className="bg-primary/10">Will Update</Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_change">No change</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="text-sm font-medium flex items-center justify-between">
              Form
              <AnimatePresence>
                {form !== "no_change" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="secondary" className="bg-primary/10">Will Update</Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </label>
            <Select value={form} onValueChange={setForm}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_change">No change</SelectItem>
                <SelectItem value="form1">Form 1</SelectItem>
                <SelectItem value="form2">Form 2</SelectItem>
                <SelectItem value="form3">Form 3</SelectItem>
                <SelectItem value="form4">Form 4</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="text-sm font-medium flex items-center justify-between">
              Subject
              <AnimatePresence>
                {subject !== "no_change" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="secondary" className="bg-primary/10">Will Update</Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_change">No change</SelectItem>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="geography">Geography</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Updating questions...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || getUpdateCount() === 0}
            className="flex-1 sm:flex-none min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : getUpdateCount() === 0 ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Select Fields
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Update {selectedQuestions.length} Questions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
