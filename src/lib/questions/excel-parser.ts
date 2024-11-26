import * as XLSX from 'xlsx';
import { z } from 'zod';

// Define the schema for question data
const QuestionSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  form: z.string().min(1, 'Form is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  question: z.string().min(1, 'Question is required'),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  option1: z.string().min(1, 'Option 1 is required'),
  option2: z.string().min(1, 'Option 2 is required'),
  option3: z.string().min(1, 'Option 3 is required'),
  option4: z.string().min(1, 'Option 4 is required'),
  explanation: z.string().optional(),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: QuestionInput;
}

export interface ParseResult {
  totalRows: number;
  validQuestions: QuestionInput[];
  errors: { row: number; errors: string[] }[];
}

export class ExcelParser {
  static createTemplate(): XLSX.WorkBook {
    const template = [
      {
        subject: 'Mathematics',
        form: 'Form 1',
        difficulty: 'Medium',
        question: 'Solve for x: 2x + 3 = 7',
        correctAnswer: '2',
        option1: '1',
        option2: '2',
        option3: '3',
        option4: '4',
        explanation: 'Subtract 3 from both sides: 2x = 4, then divide by 2: x = 2',
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(template);

    // Add column widths
    ws['!cols'] = [
      { width: 15 }, // subject
      { width: 15 }, // form
      { width: 10 }, // difficulty
      { width: 40 }, // question
      { width: 15 }, // correctAnswer
      { width: 15 }, // option1
      { width: 15 }, // option2
      { width: 15 }, // option3
      { width: 15 }, // option4
      { width: 40 }, // explanation
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Questions Template');
    return wb;
  }

  static validateRow(row: any): ValidationResult {
    try {
      const data = QuestionSchema.parse(row);
      const errors: string[] = [];

      // Additional validation
      const options = [data.option1, data.option2, data.option3, data.option4];
      if (!options.includes(data.correctAnswer)) {
        errors.push('Correct answer must match one of the options');
      }

      // Check for duplicate options
      const uniqueOptions = new Set(options);
      if (uniqueOptions.size !== options.length) {
        errors.push('All options must be unique');
      }

      return {
        isValid: errors.length === 0,
        errors,
        data: errors.length === 0 ? data : undefined,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((e) => e.message),
        };
      }
      return {
        isValid: false,
        errors: ['Invalid data format'],
      };
    }
  }

  static async parseExcelFile(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const result: ParseResult = {
            totalRows: jsonData.length,
            validQuestions: [],
            errors: [],
          };

          jsonData.forEach((row, index) => {
            const validation = this.validateRow(row);
            if (validation.isValid && validation.data) {
              result.validQuestions.push(validation.data);
            } else {
              result.errors.push({
                row: index + 2, // Add 2 to account for header row and 0-based index
                errors: validation.errors,
              });
            }
          });

          resolve(result);
        } catch (error) {
          reject(new Error('Failed to parse Excel file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  static formatQuestionForDatabase(question: QuestionInput) {
    return {
      subject: question.subject,
      form: question.form,
      difficulty: question.difficulty,
      question: question.question,
      options: [
        question.option1,
        question.option2,
        question.option3,
        question.option4,
      ],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
