import { QuestionUploadForm } from '@/components/questions/question-upload-form';

export const metadata = {
  title: 'Upload Questions - Admin Dashboard',
  description: 'Bulk upload quiz questions',
};

export default function UploadQuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Questions</h1>
        <p className="text-muted-foreground">
          Bulk upload questions using a spreadsheet file.
        </p>
      </div>
      <QuestionUploadForm />
    </div>
  );
}
