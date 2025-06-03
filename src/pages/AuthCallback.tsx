import { Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback triggered");
        console.log("URL:", window.location.href);
        
        // Check for error in URL
        const queryParams = new URLSearchParams(location.search);
        const errorParam = queryParams.get('error');
        const errorDescription = queryParams.get('error_description');
        
        if (errorParam) {
          console.error('Auth error from URL:', errorParam, errorDescription);
          setError(errorDescription || 'Authentication failed');
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: errorDescription || 'Authentication failed',
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }
        
        // Get the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Unable to authenticate');
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error.message,
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }
        
        if (data.session) {
          // Successfully authenticated
          console.log("Authentication successful");
          toast({
            title: "Authentication Successful",
            description: "You have been signed in successfully.",
          });
          navigate('/');
        } else {
          // No session found
          console.error('No session found');
          setError('Authentication failed - no session found');
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "No session found. Please try again.",
          });
          setTimeout(() => navigate('/auth'), 3000);
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        setError('Authentication failed - unexpected error');
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again.",
        });
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
            <h2 className="text-2xl font-bold mb-4">Authentication Failed</h2>
            <p className="mb-4">{error}</p>
            <p>Redirecting you back to the login page...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-cake-pink" />
            <h2 className="text-2xl font-bold mb-4">Authenticating...</h2>
            <p>Please wait while we complete your sign-in process.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;