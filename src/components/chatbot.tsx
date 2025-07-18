"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TypingDots from "./chatbot/TypingDots";
import { chatbotSetup, getChatbotResponse } from "@/services/operations/chat";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { updateChatBotChat } from "@/lib/redux/slices/chat";

export interface chatMessage {
  id: number;
  role: "User" | "Bot";
  message: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { chat :chatMessages } = useSelector((state:RootState)=>state.chat);
  // const [chatMessages, setChatMessages] = useState<chatMessage[]>(chat);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setBotTyping] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const dispatch=useDispatch()


  // Ref for messages container to handle scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isBotTyping, isInitializing]);

  // Scroll to bottom when chatbot opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100); // Small delay to ensure DOM is rendered
    }
  }, [isOpen]);

  const updateChatSlice=(data:chatMessage)=>{
    dispatch(updateChatBotChat(data));
  }

  const sendQuestions = async () => {
    if (!inputValue.trim()) return;

    const messageResponse: chatMessage = {
      id: chatMessages.length + 1,
      role: "User",
      message: inputValue,
    };

    updateChatSlice(messageResponse)
    // setChatMessages((prev) => [...prev, messageResponse]);
    setBotTyping(true);
    setInputValue("");

    try {
      const response = await getChatbotResponse({ message: inputValue });
      if (response) {
        const botResponse: chatMessage = {
          id: chatMessages.length + 2,
          role: "Bot",
          message: response,
        };
        updateChatSlice(botResponse)
        // setChatMessages((prev) => [...prev, botResponse]);
      }
    } catch (error) {
      console.error(error);
      // Add error message to chat
      const errorResponse: chatMessage = {
        id: chatMessages.length + 2,
        role: "Bot",
        message: "Sorry, I encountered an error. Please try again.",
      };
      updateChatSlice(errorResponse)
      // setChatMessages((prev) => [...prev, errorResponse]);
    }
    setBotTyping(false);
  };

  const chatbotFirstText = async () => {
    try {
      // Add a delay of 1.5 seconds before making the API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const text = await chatbotSetup();
      if (text) {
        const botResponse: chatMessage = {
          id: 1,
          role: "Bot",
          message: text,
        };
        updateChatSlice(botResponse)
        // setChatMessages([botResponse]);
      }
    } catch (error) {
      console.error(error);
      // Fallback message if setup fails
      const fallbackResponse: chatMessage = {
        id: 1,
        role: "Bot",
        message: "Hi! How can I help you today?",
      };
      updateChatSlice(fallbackResponse)
      // setChatMessages([fallbackResponse]);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen && chatMessages.length === 0 && !isInitializing) {
      // Show loader immediately when chatbot opens
      setIsInitializing(true);
      // Call the API to get welcome text (with built-in delay)
      chatbotFirstText();
    }
  }, [isOpen]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendQuestions();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-black dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-white hover:opacity-80 transition-opacity duration-200"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] shadow-xl z-40 bg-white dark:bg-gray-900 border dark:border-gray-700 flex flex-col">
          <CardHeader className="pb-3 border-b dark:border-gray-700 flex-shrink-0">
            <CardTitle className="text-lg text-black dark:text-white flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chat Help
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 p-0 min-h-0">
            {/* Messages Container - Takes remaining space */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
            >
              {/* Show initial loading before welcome message */}
              {isInitializing && chatMessages.length === 0 && (
                <div className="flex justify-start">
                  <div className="flex flex-col max-w-[80%]">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400 mb-1">
                      <Bot className="h-3 w-3" />
                      <span>Bot</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted dark:bg-gray-800 text-muted-foreground dark:text-gray-200">
                      <TypingDots />
                    </div>
                  </div>
                </div>
              )}

              {/* Regular chat messages */}
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "Bot" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div className="flex flex-col max-w-[80%]">
                    {message.role === "Bot" && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400 mb-1">
                        <Bot className="h-3 w-3" />
                        <span>Bot</span>
                      </div>
                    )}
                    {message.role === "User" && (
                      <div className="text-xs text-muted-foreground dark:text-gray-400 mb-1 text-right">
                        You
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        message.role === "Bot"
                          ? "bg-muted dark:bg-gray-800 text-muted-foreground dark:text-gray-200"
                          : "bg-black dark:bg-white text-white dark:text-black"
                      }`}
                    >
                      {message.message}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing animation for ongoing conversations (not initial) */}
              {isBotTyping && !isInitializing && (
                <div className="flex justify-start">
                  <div className="flex flex-col max-w-[80%]">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400 mb-1">
                      <Bot className="h-3 w-3" />
                      <span>Bot</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted dark:bg-gray-800 text-muted-foreground dark:text-gray-200">
                      <TypingDots />
                    </div>
                  </div>
                </div>
              )}

              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Container - Fixed at bottom */}
            <div className="p-4 border-t dark:border-gray-700 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask your questions here..."
                  onKeyPress={handleKeyPress}
                  disabled={isBotTyping || isInitializing}
                  className="flex-1"
                />
                <Button
                  onClick={sendQuestions}
                  size="icon"
                  disabled={isBotTyping || !inputValue.trim() || isInitializing}
                  className="cursor-pointer bg-black hover:bg-black hover:opacity-80 dark:bg-white dark:text-black dark:hover:bg-white dark:hover:opacity-80 flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
