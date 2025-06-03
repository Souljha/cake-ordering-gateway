import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { Link, useNavigate } from "react-router-dom";

// Define the schema for sign-in form validation
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"), // Simplified password validation for sign-in
});

// Define the type for the sign-in form values
type SignInFormValues = z.infer<typeof signInSchema>;

const SignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, isLoading, user, signInWithGoogle } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Set up the sign-in form
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSignInSubmit = async (values: SignInFormValues) => {
    try {
      await signIn(values.email, values.password);
      // Successful sign-in is handled by the AuthContext redirecting or by useEffect above
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Sign-in failed",
        description:
          error.message || "Failed to sign in. Please check your credentials and try again.",
      });
    }
  };

  const handleGoogleSignIn = () => {
    try {
      signInWithGoogle().catch((error) => {
        console.error("Google sign-in error:", error);
        toast({
          variant: "destructive",
          title: "Sign-in Error",
          description:
            error.message ||
            "Failed to sign in with Google. Please try again.",
        });
      });
    } catch (error) {
      console.error("Error triggering Google sign-in:", error);
      toast({
        variant: "destructive",
        title: "Sign-in Error",
        description:
          "Could not initiate Google sign-in. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />

      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen pt-16 pb-16">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Logo className="mx-auto mb-6" size="lg" />
            <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
            <p className="text-muted-foreground">Welcome back! Sign in to continue.</p>
          </div>

          <div className="bg-white dark:bg-card p-8 rounded-xl shadow-sm">
            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(onSignInSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          {...field}
                          autoComplete="email"
                          aria-label="Email address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            {...field}
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-cake-pink hover:bg-cake-pink/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isLoading ? "Please wait..." : "Sign in with Google"}
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/auth" className="font-medium text-cake-pink hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
