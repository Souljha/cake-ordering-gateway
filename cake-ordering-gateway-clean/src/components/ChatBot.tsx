import { Input } from "@/components/ui/input";
import { X, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { queryEmbeddings } from "@/lib/rag-setup";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client"; // Add this import
import { generateChatResponse } from "@/lib/modelService"; // Add this import

// Add missing interfaces
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);

  // Fetch user's first name if logged in
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

  // Initialize with personalized welcome message
  useEffect(() => {
    // Get time-based greeting
    const hour = new Date().getHours();
    let greeting = "Hello";
    if (hour >= 5 && hour < 12) {
      greeting = "Good morning";
    } else if (hour >= 12 && hour < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }

    // Personalize greeting if user is logged in
    const welcomeText = firstName 
      ? `${greeting}, ${firstName}! Welcome to Cake A Day. How can I assist you today?`
      : "Hello! Welcome to Cake A Day. How can I assist you today?";

    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      text: welcomeText,
      sender: "agent",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    setChatHistory([{ role: "assistant" as 'assistant', content: welcomeMessage.text }]);
  }, [user, firstName]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Update chat history
    const updatedHistory = [...chatHistory, { role: "user" as 'user', content: input }]; // Type assertion
    setChatHistory(updatedHistory);

    setInput("");
    setIsLoading(true);

    try {
 // First, try to query relevant documents using RAG
  let context = "";
  try {
    console.log("Querying embeddings for:", input);
    const relevantDocs = await queryEmbeddings(input, 5); // Increased to 5 for better context
    if (relevantDocs && relevantDocs.length > 0) {
      context = relevantDocs.map(doc => {
        // Include source information in the context
        return `[Source: ${doc.metadata.source || 'unknown'}]\n${doc.pageContent}`;
      }).join("\n\n");
      console.log(`Retrieved ${relevantDocs.length} relevant documents for context`);
      console.log("Context sample:", context.substring(0, 150) + "...");
    } else {
      console.log("No relevant documents found for query");
    }
  } catch (ragError) {
    console.error("RAG error details:", ragError);
    console.warn("Could not retrieve embeddings, continuing without RAG context");
    // Continue without RAG context
  }
  
  // Create a system message with context (if available)
  const systemMessage = {
    role: "system" as 'system', // Type assertion for role
    content: `You are a concise, friendly, and helpful assistant for Cake A Day, a cake shop based in South Africa. 
Your responses should be short and to the point.
When providing prices, always use the format "R[amount]" for South African Rands.
${context ? `Answer questions based on this context information:\n${context}` : ""}
If you don't have specific information about a product or service in the context, check if it appears in our product listings before saying we don't offer it.
Only answer questions related to the Cake A Day website and products. If you cannot find the answer in the provided context or website information, politely state that you'll need to check with the team for more details.`
  };

  const messagesForApi = [
    systemMessage,
    // updatedHistory is now correctly typed, so direct mapping should work,
    // but explicit assertion doesn't hurt.
    ...updatedHistory.map(msg => ({ ...msg, role: msg.role as 'user' | 'assistant' })) 
  ];
  
  let response;
  try {
    // Try using the configured AI service (now Groq)
    response = await generateChatResponse(messagesForApi);
  } catch (apiError) {
    console.error("AI Service API error:", apiError);
    
    // Fallback response when the API is unavailable or errors out
    response = "I'm sorry, I'm having trouble connecting to my knowledge base right now. " +
      "Please try again later or contact us directly at contact@cakeaday.com or call (123) 456-7890 " +
      "for immediate assistance with your cake order or inquiry.";
  }

  // Add bot response to chat
  const botMessage: Message = {
    id: `agent-${Date.now()}`,
    text: response,
    sender: "agent",
    timestamp: new Date(),
  };

  setMessages((prev) => [...prev, botMessage]);
  
  // Update chat history with bot response
  setChatHistory([...updatedHistory, {role: "assistant" as 'assistant', content: response}]); // Type assertion
} catch (error) {
  console.error("Error in chat flow:", error);

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "Sorry, I'm having trouble thinking right now. Please try again.",
        sender: "agent",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-card rounded-lg shadow-lg flex flex-col border border-gray-200 z-50">
      <div className="bg-primary text-primary-foreground p-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Cake A Day Assistant</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-primary-foreground hover:text-primary-foreground/80"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 ${
                  message.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {message.text}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-2">
                <div className="inline-block p-2 rounded-lg bg-muted text-foreground rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-r-none"
            id="chat-input"
            name="chat-input"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="rounded-l-none"
            aria-label="Send message"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
