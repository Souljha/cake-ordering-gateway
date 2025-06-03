import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";

const Greeting: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [firstName, setFirstName] = useState("");
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);

  // Get time-based greeting
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        return "Good Morning";
      } else if (hour >= 12 && hour < 18) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    };

    setGreeting(getGreeting());

    // Update greeting every minute
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Handle scroll events to change text color
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get user's first name if logged in
  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("first_name")
            .eq("id", user.id)
            .single();
          
          if (data && data.first_name) {
            setFirstName(data.first_name);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserName();
  }, [user]);

  if (isLoading) return null;

  return (
    <div className={`
      font-bold transition-all duration-300
      ${scrolled ? 'text-gray-800' : 'text-white'}
      ${isMobile ? 'text-xs py-1 px-2 text-center truncate' : 'text-lg py-2 px-4'}
    `}>
      <span>{greeting}{firstName ? `, ${firstName}` : ""}</span>
    </div>
  );
};

export default Greeting;