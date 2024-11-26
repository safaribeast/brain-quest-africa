import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileSpreadsheet, Plus } from 'lucide-react';

export const metadata = {
  title: 'Questions Management - Admin Dashboard',
  description: 'Manage quiz questions',
};

export default function ManageQuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Questions Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage quiz questions.
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/manage-questions/upload">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Bulk Upload
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/manage-questions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
