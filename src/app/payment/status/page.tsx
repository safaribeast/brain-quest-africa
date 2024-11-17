import { redirect } from 'next/navigation';

export default function PaymentStatus({
  searchParams,
}: {
  searchParams: { status: string };
}) {
  const status = searchParams.status?.toLowerCase();

  if (!status) {
    redirect('/');
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'completed':
        return 'Payment completed successfully! You can now access your premium content.';
      case 'failed':
        return 'Payment failed. Please try again or contact support if the problem persists.';
      case 'pending':
        return 'Payment is pending. Please wait while we confirm your payment.';
      default:
        return 'Payment status unknown. Please contact support if you need assistance.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Payment Status</h2>
            <div className={`rounded-md p-4 ${getStatusColor()}`}>
              <p className="text-sm font-medium">{getStatusMessage()}</p>
            </div>
            
            <div className="mt-6">
              <a
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
