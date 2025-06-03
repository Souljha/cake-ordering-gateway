import { useNavigate } from "react-router-dom";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Update the interface to match the actual return type
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>; // Change return type to Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }
  
      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });
  
      navigate("/");
    } catch (error: any) {
      console.error("Sign in error details:", error);
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setIsLoading(true);
    try {
      // supabase.auth.signUp will handle the check for an existing user with the same email.
      // If the email already exists in auth.users, it will return an error.
      // We can remove the manual check against the 'profiles' table for the email.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
  
      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
  
      if (data.user) {
        try {
          // Use upsert to either insert a new profile or update an existing one if the id already exists.
          // This handles cases where auth.signUp succeeds for an existing user (e.g., after email confirmation)
          // or if a previous profile insert attempt failed but the auth user was created.
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id, // This is the conflict target (primary key)
              first_name: firstName,
              last_name: lastName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(), // Explicitly set updated_at
              avatar_url: null, // Explicitly set avatar_url to null
            });
  
          if (profileError) {
            console.error("Error creating profile:", profileError);
            // Throw an error that includes the profileError's message
            // This will be caught by the outer catch block.
            throw new Error(profileError.message || "Failed to save profile information.");
          }

          // If profile insertion was successful
          toast({
            title: "Account created successfully!",
            description: "Please check your email for verification instructions.",
          });
          navigate("/");

        } catch (profileInsertCatchError: any) {
          // This catches errors from the .insert() call itself (e.g. network issues before Supabase responds)
          // or the error explicitly thrown above if profileError occurred.
          console.error("Exception during profile creation/saving:", profileInsertCatchError);
          // Re-throw to be caught by the main signUp catch block
          throw profileInsertCatchError;
        }
      } else {
        // This case implies supabase.auth.signUp itself didn't return a user object,
        // even if it didn't return an explicit error. This is unusual.
        throw new Error("Failed to create user account (no user data returned from auth).");
      }
    } catch (error: any) {
      // This outer catch now receives more specific errors from the profile insertion step if they occurred.
      console.error("Sign up process error:", error);
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Log the actual URL being used
      console.log("Current URL:", window.location.href);
      console.log("Current origin:", window.location.origin);
      
      // Make sure the redirectTo URL is properly encoded and formatted
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Redirect URL:", redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // Add scopes for Google OAuth
          scopes: 'email profile',
        },
      });
      
      if (error) {
        console.error("OAuth error:", error);
        throw error;
      }
      
      // This will redirect the user to Google's auth page
      // The function will not return anything meaningful here
      // as the browser will navigate away
      return data;
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsLoading(false); // Make sure to set loading to false in case of error
      throw error;
    }
    // Remove the finally block since the browser will navigate away
    // and this code won't execute
  }

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error?.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
