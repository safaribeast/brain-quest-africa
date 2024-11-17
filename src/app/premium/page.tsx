'use client';

import PaymentButton from '@/components/PaymentButton';

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Get Premium Access</h1>
          <p className="mt-2 text-lg text-gray-600">
            Unlock all features and get unlimited access to quizzes
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center mb-8">Premium Features</h2>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited access to all quiz categories</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Detailed performance analytics and progress tracking</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Ad-free experience</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Premium support</span>
              </li>
            </ul>

            <div className="text-center mb-8">
              <div className="text-4xl font-bold mb-2">10,000 TZS</div>
              <div className="text-gray-600">One-time payment</div>
            </div>

            <PaymentButton 
              amount={10000} 
              description="Premium Access to Brain Quest Africa"
            />

            <p className="text-sm text-gray-500 text-center mt-4">
              Secure payment powered by PesaPal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
