import { BulkQuestionUpload } from '@/components/questions/bulk-upload';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Upload Questions - Admin Dashboard',
  description: 'Bulk upload questions using Excel template',
};

export default function AdminQuestionsUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload Questions</h1>
        <p className="text-muted-foreground">
          Upload multiple questions at once using our Excel template.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <BulkQuestionUpload />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Download the Excel template using the button above</li>
            <li>Fill in your questions following the template format</li>
            <li>Required fields: Subject, Topic, Question, Options, Correct Answer</li>
            <li>Optional fields: Subtopic, Difficulty, Explanation, Tags</li>
            <li>Save your Excel file</li>
            <li>Upload the completed file using the upload button</li>
            <li>Review any errors and fix them in your Excel file</li>
            <li>Re-upload if necessary</li>
          </ol>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Use clear and concise language for questions</li>
              <li>Ensure the correct answer matches one of the options exactly</li>
              <li>Use comma-separated values for tags (e.g., "algebra,equations")</li>
              <li>Keep explanations clear and helpful for students</li>
              <li>Double-check all answers before uploading</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
