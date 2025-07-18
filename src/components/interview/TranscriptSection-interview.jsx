"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquare, Brain, User, Download, Save } from "lucide-react";

const TranscriptSection = ({
  messages,
  currentTranscript,
  isTyping,
  isSpeaking,
  isConnected,
  currentSpeaker,
  isCompact = false,
}) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [debouncedTranscript, setDebouncedTranscript] = useState("");
  const debounceTimerRef = useRef(null);
  const throttleTimerRef = useRef(null);
  const lastProcessedMessageRef = useRef(null);
  const conversationStartTime = useRef(new Date());
  const callEndedRef = useRef(false);

  // Enhanced debounce function with immediate execution option
  const debounce = useCallback((func, delay, immediate = false) => {
    return (...args) => {
      const later = () => {
        clearTimeout(debounceTimerRef.current);
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !debounceTimerRef.current;
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(later, delay);
      
      if (callNow) func(...args);
    };
  }, []);

  // Enhanced throttle function with trailing execution
  const throttle = useCallback((func, limit) => {
    let lastFunc;
    let lastRan;
    
    return function() {
      const context = this;
      const args = arguments;
      
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function() {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }, []);

  // Debounced transcript update
  const updateDebouncedTranscript = useCallback(
    debounce((transcript) => {
      setDebouncedTranscript(transcript);
    }, 300),
    []
  );

  // Throttled conversation history update with duplicate prevention
  const updateConversationHistory = useCallback(
    throttle((newMessage) => {
      if (newMessage && newMessage.text && newMessage.text.trim()) {
        setConversationHistory(prev => {
          // Enhanced duplicate check with fuzzy matching
          const isDuplicate = prev.some(msg => {
            const sameSpeaker = msg.speaker === newMessage.speaker;
            const similarText = msg.text.includes(newMessage.text) || 
                              newMessage.text.includes(msg.text) || 
                              msg.text === newMessage.text;
            const recentTime = Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 2000;
            
            return sameSpeaker && similarText && recentTime;
          });
          
          if (!isDuplicate) {
            return [...prev, {
              ...newMessage,
              // Add sequence number to help with ordering
              sequence: prev.length + 1
            }];
          }
          return prev;
        });
      }
    }, 500),
    []
  );

  // Effect to handle current transcript debouncing
  useEffect(() => {
    if (currentTranscript?.trim()) {
      updateDebouncedTranscript(currentTranscript);
    }
  }, [currentTranscript, updateDebouncedTranscript]);

  // Generate conversation text format with enhanced formatting
  const generateConversationText = useCallback(() => {
    const header = `Interview Transcript\n
Date: ${conversationStartTime.current.toLocaleDateString()}
Time: ${conversationStartTime.current.toLocaleTimeString()}
Duration: ${Math.round((new Date() - conversationStartTime.current) / 1000 / 60)} minutes
Total Messages: ${conversationHistory.length}
Status: ${callEndedRef.current ? 'Completed' : 'In Progress'}

${'='.repeat(50)}\n\n`;

    const conversation = conversationHistory.map((msg, index) => {
      const timestamp = new Date(msg.timestamp);
      const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const speaker = getSpeakerLabel(msg.speaker);
      
      return `[${timeStr}] ${speaker}: ${msg.text}`;
    }).join('\n\n');

    const footer = `\n\n${'='.repeat(50)}\n\nConversation ${
      callEndedRef.current ? 'ended' : 'last updated'
    } at: ${new Date().toLocaleTimeString()}`;

    return header + conversation + footer;
  }, [conversationHistory]);

  // Effect to handle new messages and store them
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage && 
          lastMessage.text && 
          lastMessage.text.trim() &&
          lastMessage !== lastProcessedMessageRef.current) {
        
        const messageWithTimestamp = {
          ...lastMessage,
          timestamp: new Date().toISOString(),
          id: Date.now() + Math.random().toString(36).substring(2, 9) // Better unique ID
        };
        
        updateConversationHistory(messageWithTimestamp);
        lastProcessedMessageRef.current = lastMessage;
      }
    }
  }, [messages, updateConversationHistory]);

  // Effect to detect call end and log final conversation
  useEffect(() => {
    if (wasConnected && !isConnected) {
      callEndedRef.current = true;
      logFinalConversation();
    }
  }, [isConnected]);

  // Store previous connection status to detect changes
  const wasConnected = usePrevious(isConnected);
  
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  // Log final conversation when call ends
  const logFinalConversation = useCallback(() => {
    const conversationData = {
      history: conversationHistory,
      startTime: conversationStartTime.current,
      endTime: new Date().toISOString(),
      duration: Math.round((new Date() - conversationStartTime.current) / 1000 / 60) + ' minutes',
      formattedText: generateConversationText()
    };
    
    console.log('📝 Final Interview Transcript:', {
      totalMessages: conversationHistory.length,
      duration: conversationData.duration,
      participants: {
        HR: conversationHistory.filter(m => m.speaker === 'assistant').length,
        Applicant: conversationHistory.filter(m => m.speaker === 'user').length
      },
      fullTranscript: conversationData.formattedText,
      accessVariable: 'window.interviewTranscript'
    });
    
    // Store in global variables
    window.interviewTranscript = conversationData;
    window.interviewTranscriptText = conversationData.formattedText;
    // Save to localStorage for cross-page access
    try {
      localStorage.setItem('interviewTranscriptText', conversationData.formattedText);
    } catch (e) {
      console.error('Failed to save transcript to localStorage:', e);
    }
  }, [conversationHistory, generateConversationText]);

  // Auto-update conversation data
  useEffect(() => {
    if (conversationHistory.length > 0) {
      const conversationData = {
        history: conversationHistory,
        startTime: conversationStartTime.current,
        lastUpdated: new Date().toISOString(),
        formattedText: generateConversationText()
      };
      
      window.interviewTranscript = conversationData;
      window.interviewTranscriptText = conversationData.formattedText;
    }
  }, [conversationHistory, generateConversationText]);

  // Save conversation to file
  const saveConversation = useCallback(() => {
    const conversationText = generateConversationText();
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview_transcript_${new Date().toISOString().split('T')[0]}_${
      callEndedRef.current ? 'final' : 'partial'
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateConversationText]);

  // Copy conversation to clipboard
  const copyConversation = useCallback(async () => {
    try {
      const conversationText = generateConversationText();
      await navigator.clipboard.writeText(conversationText);
      console.log('Conversation copied to clipboard');
    } catch (err) {
      console.error('Failed to copy conversation:', err);
    }
  }, [generateConversationText]);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    setConversationHistory([]);
    conversationStartTime.current = new Date();
    callEndedRef.current = false;
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
      
      // Log final conversation if component unmounts during a call
      if (isConnected && conversationHistory.length > 0) {
        logFinalConversation();
      }
    };
  }, [isConnected, conversationHistory.length, logFinalConversation]);

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  const getSpeakerLabel = (role) => {
    if (role === "assistant") return "HR";
    if (role === "user") return "Applicant";
    return "";
  };

  const renderMessage = (message, isTyping = false) => {
    if (!message || !message.text) return null;

    const prefix = `${getSpeakerLabel(message.speaker)}: `;
    return (
      <div className="mt-4 text-lg text-white font-medium animate-fadeIn">
        <span className="text-blue-400">{prefix}</span>
        <span className={isTyping ? "italic opacity-70" : ""}>
          {message.text}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`w-full h-full rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm shadow-inner ${
        isCompact ? "" : "p-4"
      } flex flex-col justify-between`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b border-gray-800 rounded-t-2xl bg-gradient-to-r from-gray-900/50 to-gray-800/30`}
      >
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Transcript</h3>
            <p className="text-sm text-gray-400">
              {conversationHistory.length} messages stored
              {callEndedRef.current && " (Call ended)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-400">
          {/* Conversation Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={saveConversation}
              className="p-1 rounded hover:bg-gray-800 transition-colors"
              title="Download transcript"
              disabled={conversationHistory.length === 0}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={copyConversation}
              className="p-1 rounded hover:bg-gray-800 transition-colors"
              title="Copy to clipboard"
              disabled={conversationHistory.length === 0}
            >
              <Save className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>{messages.length}</span>
          </div>
          {isConnected && (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">
                Live
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-start px-6">
        {debouncedTranscript?.trim()
          ? renderMessage(
              {
                speaker: currentSpeaker || "user",
                text: debouncedTranscript,
              },
              true
            )
          : lastMessage
          ? renderMessage(lastMessage)
          : !isTyping && !isSpeaking && (
              <p className="text-gray-400 italic text-sm">Waiting for interaction...</p>
            )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 rounded-b-2xl text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {isTyping && (
            <div className="flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>Typing</span>
            </div>
          )}
          {currentSpeaker && isSpeaking && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
              {currentSpeaker === "assistant" ? (
                <Brain className="w-3 h-3 text-purple-400" />
              ) : (
                <User className="w-3 h-3 text-blue-400" />
              )}
              <span className="text-blue-400 font-medium">
                {getSpeakerLabel(currentSpeaker)}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500">
            {Math.round((new Date() - conversationStartTime.current) / 1000 / 60)}m
          </span>
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isSpeaking
                  ? "bg-green-500 animate-pulse shadow-md shadow-green-500/40"
                  : "bg-gray-500"
              }`}
            />
            <span className={`${isSpeaking ? "text-green-400" : "text-gray-500"}`}>
              {isSpeaking ? "Active" : "Standby"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptSection;