import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // optional if using shadcn/ui or Tailwind CSS
import { CheckCircle } from 'lucide-react'; // optional icon

const Verified = () => {
  const [searchParams] = useSearchParams();
  const already = searchParams.get('already') === 'true';
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">
          {already ? "Account Already Verified!" : "Email Verified Successfully!"}
        </h1>
        <p className="text-gray-600 mb-6">
          {already
            ? "You’ve already verified your account. You can now log in."
            : "Your email has been verified. You can now log in to your account."}
        </p>
        <Button onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default Verified;
