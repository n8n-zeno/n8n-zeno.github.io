import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Optional: verify the session_id with your backend
    if (!sessionId) {
      navigate('/');
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-svh bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-[#080808] border border-[#222] rounded-xl flex flex-col items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <CheckCircle className="size-16 text-green-500 mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-zinc-400 mb-8">
          Thank you for upgrading to Pro. Your account has been updated successfully.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-semibold rounded-[10px]"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
