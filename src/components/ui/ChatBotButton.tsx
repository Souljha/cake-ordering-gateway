import { ChatBot } from '@/components/ChatBot';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export function ChatBotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && <ChatBot isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
}