import React, { useState, useEffect, useRef } from 'react';

// --- Helper Icons ---
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/>
    </svg>
);

// --- The Main Chatbot Component ---
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your ProGrade assistant. How can I help you today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // IMPORTANT: Paste your API key here.
  // In a real production app, this should be handled on a server to keep it secure.
  const apiKey = "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"; 

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    // // This check ensures the developer has added the key.
    // if (apiKey === "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") {
    //     setMessages(prev => [...prev, { role: 'assistant', content: 'API Key not configured. Please add your key to the Chatbot.jsx file.' }]);
    //     return;
    // }

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "z-ai/glm-4.5-air:free",
          "messages": newMessages.slice(-10) 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'An API error occurred.');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message;
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Chat Window */}
      <div className={`bg-white w-80 sm:w-96 h-[60vh] flex flex-col rounded-xl shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 rounded-t-xl flex justify-between items-center">
            <h3 className="text-lg font-semibold">ProGrade Assistant</h3>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="flex flex-col space-y-3">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                            <p className="text-sm break-words">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 border-t bg-white rounded-b-xl">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button type="submit" className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" disabled={isLoading || !userInput.trim()}>
                    <SendIcon />
                </button>
            </div>
        </form>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center mt-4 float-right hover:bg-gray-900 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-500"
        aria-label="Toggle Chat"
      >
        {isOpen ? <CloseIcon /> : <BotIcon />}
      </button>
    </div>
  );
};

export default Chatbot;
