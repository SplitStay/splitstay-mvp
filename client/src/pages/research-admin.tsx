import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ResearchSession {
  id: string;
  startTime: string;
  endTime?: string;
  recordedActions: {
    type: string;
    target: string;
    timestamp: number;
    path: string;
    metadata?: any;
  }[];
  hasAudioRecording: boolean;
  feedback?: {
    rating?: number;
    feedbackText?: string;
    wouldUse?: boolean;
    knowsOthersWhoWouldUse?: boolean;
    contactEmail?: string;
    createdAt: string;
  };
}

const ResearchAdmin: React.FC = () => {
  const { data: sessions, isLoading, error, refetch } = useQuery<ResearchSession[]>({
    queryKey: ['/api/research/data'],
    refetchOnWindowFocus: false,
    retry: false,
    onError: (error) => {
      console.error('Error loading research data:', error);
    }
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'In progress';
    
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const durationMs = endTime - startTime;
    
    if (durationMs < 0) return 'Invalid duration';
    
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  const playAudio = async (sessionId: string) => {
    try {
      // Create an audio element to play the recording
      const audio = new Audio(`/api/research/audio/${sessionId}`);
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Could not play the audio recording. The file may be corrupted or missing.');
    }
  };

  const renderStarRating = (rating?: number) => {
    if (!rating) return 'No rating';
    
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ));
  };

  const downloadSession = (session: ResearchSession) => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `session-${session.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Research Data Admin</h1>
          <Button onClick={() => refetch()}>Refresh Data</Button>
        </div>
        
        {isLoading && <p>Loading research data...</p>}
        {error && <p className="text-red-500">Error loading research data: {String(error)}</p>}
        
        {sessions && sessions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No research data collected yet</p>
            </CardContent>
          </Card>
        )}
        
        {sessions && sessions.length > 0 && (
          <Tabs defaultValue="sessions">
            <TabsList className="mb-4">
              <TabsTrigger value="sessions">All Sessions ({sessions.length})</TabsTrigger>
              <TabsTrigger value="feedback">
                With Feedback ({sessions.filter(s => s.feedback).length})
              </TabsTrigger>
              <TabsTrigger value="audio">
                With Audio ({sessions.filter(s => s.hasAudioRecording).length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sessions">
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Session {session.id.substring(0, 8)}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            Started: {formatDate(session.startTime)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.feedback && (
                            <Badge variant="outline" className="bg-blue-50">
                              Feedback
                            </Badge>
                          )}
                          {session.hasAudioRecording && (
                            <Badge variant="outline" className="bg-green-50">
                              Audio
                            </Badge>
                          )}
                          <Badge variant="outline">
                            {formatDuration(session.startTime, session.endTime)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Accordion type="single" collapsible>
                        {session.feedback && (
                          <AccordionItem value="feedback">
                            <AccordionTrigger>User Feedback</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 p-2 bg-gray-50 rounded-md">
                                <p className="font-semibold">Rating: {renderStarRating(session.feedback.rating)}</p>
                                {session.feedback.feedbackText && (
                                  <div>
                                    <p className="font-semibold">Comments:</p>
                                    <p className="text-gray-700 italic">"{session.feedback.feedbackText}"</p>
                                  </div>
                                )}
                                {session.feedback.contactEmail && (
                                  <p className="text-sm">Contact: {session.feedback.contactEmail}</p>
                                )}
                                <div className="flex space-x-4 text-sm">
                                  <p>Would use: {session.feedback.wouldUse ? '✅ Yes' : '❌ No'}</p>
                                  <p>Knows others who would use: {session.feedback.knowsOthersWhoWouldUse ? '✅ Yes' : '❌ No'}</p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                        
                        <AccordionItem value="actions">
                          <AccordionTrigger>User Actions ({session.recordedActions.length})</AccordionTrigger>
                          <AccordionContent>
                            <div className="max-h-72 overflow-y-auto border rounded-md">
                              <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="p-2 text-left">Time</th>
                                    <th className="p-2 text-left">Type</th>
                                    <th className="p-2 text-left">Target</th>
                                    <th className="p-2 text-left">Path</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {session.recordedActions.map((action, i) => (
                                    <tr key={i} className="border-t hover:bg-gray-50">
                                      <td className="p-2 font-mono">
                                        {format(new Date(action.timestamp), 'HH:mm:ss')}
                                      </td>
                                      <td className="p-2">
                                        <Badge variant="outline" className="font-normal">
                                          {action.type}
                                        </Badge>
                                      </td>
                                      <td className="p-2 max-w-xs truncate">{action.target}</td>
                                      <td className="p-2 text-gray-500">{action.path}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      
                      <div className="flex space-x-2 mt-4">
                        {session.hasAudioRecording && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => playAudio(session.id)}
                          >
                            Play Audio
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadSession(session)}
                        >
                          Download Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="feedback">
              <div className="space-y-4">
                {sessions
                  .filter(s => s.feedback)
                  .map((session) => (
                    <Card key={session.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Feedback for Session {session.id.substring(0, 8)}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              Session started: {formatDate(session.startTime)}
                            </p>
                          </div>
                          <div>
                            {session.feedback && (
                              <div className="text-xl">
                                {renderStarRating(session.feedback.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {session.feedback && (
                          <div className="space-y-4">
                            {session.feedback.feedbackText && (
                              <div>
                                <h3 className="font-semibold mb-1">Feedback:</h3>
                                <p className="text-gray-700 italic bg-gray-50 p-3 rounded-md">
                                  "{session.feedback.feedbackText}"
                                </p>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-semibold mb-1">Would use SplitStay:</h3>
                                <p>
                                  {session.feedback.wouldUse 
                                    ? '✅ Yes' 
                                    : session.feedback.wouldUse === false 
                                      ? '❌ No' 
                                      : '❓ Unknown'}
                                </p>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-1">Knows potential users:</h3>
                                <p>
                                  {session.feedback.knowsOthersWhoWouldUse 
                                    ? '✅ Yes' 
                                    : session.feedback.knowsOthersWhoWouldUse === false 
                                      ? '❌ No' 
                                      : '❓ Unknown'}
                                </p>
                              </div>
                            </div>
                            
                            {session.feedback.contactEmail && (
                              <div>
                                <h3 className="font-semibold mb-1">Contact Email:</h3>
                                <p>{session.feedback.contactEmail}</p>
                              </div>
                            )}
                            
                            <div className="flex space-x-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadSession(session)}
                              >
                                Download Data
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="audio">
              <div className="space-y-4">
                {sessions
                  .filter(s => s.hasAudioRecording)
                  .map((session) => (
                    <Card key={session.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Audio for Session {session.id.substring(0, 8)}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              Recorded: {formatDate(session.startTime)}
                            </p>
                          </div>
                          <div>
                            <Badge variant="outline">
                              {formatDuration(session.startTime, session.endTime)}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="mb-4">
                          <Button 
                            onClick={() => playAudio(session.id)}
                            className="w-full"
                          >
                            Play Voice Feedback
                          </Button>
                        </div>
                        
                        {session.feedback && (
                          <div className="pt-2 border-t">
                            <h3 className="font-semibold mb-2">Written Feedback:</h3>
                            {session.feedback.feedbackText ? (
                              <p className="text-gray-700 italic bg-gray-50 p-3 rounded-md">
                                "{session.feedback.feedbackText}"
                              </p>
                            ) : (
                              <p className="text-gray-500">No written feedback provided</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default ResearchAdmin;