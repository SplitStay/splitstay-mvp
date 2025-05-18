import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowLeft,
  Search,
  MoreVertical,
  Send,
  Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatar";
import { Separator } from "@/components/ui/separator";

interface ConversationProps {
  id: string;
  user: {
    fullName: string;
    profilePicture: string;
    isVerified?: boolean;
  };
  lastMessage: string;
  time: string;
  unreadCount?: number;
}

const Messages: React.FC = () => {
  const [_, navigate] = useLocation();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  
  // Mock conversations data
  const conversations: ConversationProps[] = [
    {
      id: "1",
      user: {
        fullName: "Hannah Kim",
        profilePicture: "https://i.pravatar.cc/150?img=29",
        isVerified: true
      },
      lastMessage: "Looking forward to our stay in London!",
      time: "2h ago",
      unreadCount: 2
    },
    {
      id: "2",
      user: {
        fullName: "Sophie Müller",
        profilePicture: "https://i.pravatar.cc/150?img=5",
        isVerified: true
      },
      lastMessage: "It was nice meeting you in Paris!",
      time: "Yesterday",
    },
    {
      id: "3",
      user: {
        fullName: "Maria Rodriguez",
        profilePicture: "https://i.pravatar.cc/150?img=10",
        isVerified: false
      },
      lastMessage: "Are you still looking for a roommate in Barcelona?",
      time: "2d ago",
    }
  ];

  const mockMessages = [
    { id: "1", sender: "other", text: "Hi there! I saw we're matched for the London trip.", time: "10:30 AM" },
    { id: "2", sender: "me", text: "Yes! I'm really excited about it.", time: "10:32 AM" },
    { id: "3", sender: "other", text: "Me too! Have you been to London before?", time: "10:35 AM" },
    { id: "4", sender: "me", text: "Once, but only for a short trip. This time I want to explore more.", time: "10:38 AM" },
    { id: "5", sender: "other", text: "Great! I've been a few times. Would love to show you around some of my favorite spots.", time: "10:40 AM" },
    { id: "6", sender: "me", text: "That would be amazing! I'd really appreciate that.", time: "10:45 AM" },
    { id: "7", sender: "other", text: "Looking forward to our stay in London!", time: "11:00 AM" },
  ];
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // In a real app, we would send the message to the API
    console.log("Sending message:", messageText);
    setMessageText("");
  };
  
  const renderConversationList = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Messages</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {}}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id}
            className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 ${
              activeConversation === conversation.id ? "bg-gray-100" : ""
            }`}
            onClick={() => setActiveConversation(conversation.id)}
          >
            <UserAvatar 
              user={conversation.user}
              showVerified={conversation.user.isVerified}
              size="md"
            />
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-medium truncate">{conversation.user.fullName}</p>
                <span className="text-xs text-gray-500">{conversation.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
            </div>
            {conversation.unreadCount && (
              <div className="ml-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {conversation.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <Button 
          className="w-full navy-button"
          onClick={() => navigate("/find-roommate")}
        >
          Find New Roommates
        </Button>
      </div>
    </div>
  );
  
  const renderConversation = () => {
    const conversation = conversations.find(c => c.id === activeConversation);
    if (!conversation) return null;
    
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setActiveConversation(null)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <UserAvatar 
            user={conversation.user}
            showVerified={conversation.user.isVerified}
            size="sm"
          />
          <div className="ml-3 flex-1">
            <p className="font-medium">{conversation.user.fullName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {}}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'other' && (
                <UserAvatar 
                  user={conversation.user}
                  size="sm"
                  className="mr-2 self-end"
                />
              )}
              <div className="max-w-[70%]">
                <div 
                  className={`p-3 rounded-2xl ${
                    message.sender === 'me'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{message.time}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500"
              onClick={() => {}}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              className="flex-1 mx-2"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button
              className={`rounded-full ${messageText.trim() ? 'navy-button' : 'bg-gray-200 text-gray-500'}`}
              size="icon"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-[calc(100vh-4rem)] pb-20">
      {activeConversation ? renderConversation() : renderConversationList()}
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => navigate("/profile")}
          >
            <Search className="h-5 w-5 mb-1" />
            <span>Profile</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => navigate("/dashboard")}
          >
            <Search className="h-5 w-5 mb-1" />
            <span>Trips</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => navigate("/find-roommate")}
          >
            <Search className="h-5 w-5 mb-1" />
            <span>Explore</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs text-primary"
            onClick={() => navigate("/messages")}
          >
            <Search className="h-5 w-5 mb-1" />
            <span>Messages</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center text-xs"
            onClick={() => {}}
          >
            <Search className="h-5 w-5 mb-1" />
            <span>Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Messages;