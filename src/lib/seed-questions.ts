import { db } from '@/lib/firebase';
import { collection, addDoc, query, getDocs, where } from 'firebase/firestore';
import { Question, QuestionSubject, QuestionGrade, QuestionDifficulty } from '@/types/question';

const sampleQuestions: Partial<Question>[] = [
  // Mathematics
  {
    text: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    subject: 'mathematics',
    grade: 'form1',
    difficulty: 'easy',
  },
  {
    text: 'Solve: 3x + 6 = 15',
    options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
    correctAnswer: 'x = 3',
    subject: 'mathematics',
    grade: 'form1',
    difficulty: 'easy',
  },
  // Geography
  {
    text: 'What is the capital of Tanzania?',
    options: ['Dodoma', 'Dar es Salaam', 'Arusha', 'Mwanza'],
    correctAnswer: 'Dodoma',
    subject: 'geography',
    grade: 'form1',
    difficulty: 'easy',
  },
  {
    text: 'Which is the largest lake in Africa?',
    options: ['Lake Victoria', 'Lake Tanganyika', 'Lake Nyasa', 'Lake Turkana'],
    correctAnswer: 'Lake Victoria',
    subject: 'geography',
    grade: 'form1',
    difficulty: 'easy',
  },
  // Chemistry
  {
    text: 'What is the chemical symbol for water?',
    options: ['H2O', 'CO2', 'O2', 'N2'],
    correctAnswer: 'H2O',
    subject: 'chemistry',
    grade: 'form1',
    difficulty: 'easy',
  },
  {
    text: 'What is the atomic number of Carbon?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '6',
    subject: 'chemistry',
    grade: 'form1',
    difficulty: 'easy',
  }
];

export async function seedQuestions() {
  try {
    // Check if questions exist for each subject
    const subjects: QuestionSubject[] = ['mathematics', 'geography', 'chemistry'];
    
    for (const subject of subjects) {
      const q = query(
        collection(db, 'questions'),
        where('subject', '==', subject)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log(`Seeding ${subject} questions...`);
        
        // Add sample questions for this subject
        const subjectQuestions = sampleQuestions.filter(q => q.subject === subject);
        for (const question of subjectQuestions) {
          await addDoc(collection(db, 'questions'), {
            ...question,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        
        console.log(`${subject} questions seeded successfully!`);
      } else {
        console.log(`Questions already exist for ${subject}`);
      }
    }
  } catch (error) {
    console.error('Error seeding questions:', error);
  }
}

// Helper function to check if questions exist for specific match settings
export async function checkQuestionsExist(settings: {
  subject: QuestionSubject;
  grade: QuestionGrade;
  difficulty: QuestionDifficulty;
}) {
  const q = query(
    collection(db, 'questions'),
    where('subject', '==', settings.subject),
    where('grade', '==', settings.grade),
    where('difficulty', '==', settings.difficulty)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
} 