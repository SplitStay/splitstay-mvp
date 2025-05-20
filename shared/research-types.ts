// Types for research data

export type UserAction = {
  type: 'click' | 'navigation' | 'input' | 'focus' | 'blur' | 'scroll';
  target: string;
  timestamp: number;
  path: string;
  metadata?: any;
};

export interface ResearchSession {
  id: string;
  userId?: number;
  startTime: Date;
  endTime?: Date;
  recordedActions: UserAction[];
  hasAudioRecording: boolean;
}

export interface ResearchFeedback {
  sessionId: string;
  rating?: number;
  feedbackText?: string;
  wouldUse?: boolean;
  knowsOthersWhoWouldUse?: boolean;
  contactEmail?: string;
  createdAt: Date;
}

export interface AudioRecording {
  sessionId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  duration?: number;
  audioData: string; // Base64 encoded audio data
}