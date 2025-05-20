import fs from 'fs';
import path from 'path';
import { ResearchSession, ResearchFeedback, AudioRecording } from '@shared/research-types';

// Create directories for storing research data
const RESEARCH_DIR = path.join(process.cwd(), 'research-data');
const SESSIONS_DIR = path.join(RESEARCH_DIR, 'sessions');
const FEEDBACK_DIR = path.join(RESEARCH_DIR, 'feedback');
const AUDIO_DIR = path.join(RESEARCH_DIR, 'audio');

// Ensure directories exist
if (!fs.existsSync(RESEARCH_DIR)) {
  fs.mkdirSync(RESEARCH_DIR, { recursive: true });
}
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}
if (!fs.existsSync(FEEDBACK_DIR)) {
  fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
}
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

export class ResearchStorage {
  // Save a research session
  async saveSession(session: ResearchSession): Promise<ResearchSession> {
    const filePath = path.join(SESSIONS_DIR, `${session.id}.json`);
    const data = JSON.stringify(session, null, 2);
    
    await fs.promises.writeFile(filePath, data, 'utf-8');
    return session;
  }
  
  // Get a specific session
  async getSession(sessionId: string): Promise<ResearchSession | null> {
    const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
    
    try {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data) as ResearchSession;
    } catch (error) {
      return null;
    }
  }
  
  // Get all sessions
  async getAllSessions(): Promise<ResearchSession[]> {
    try {
      const files = await fs.promises.readdir(SESSIONS_DIR);
      const sessions: ResearchSession[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(SESSIONS_DIR, file);
          const data = await fs.promises.readFile(filePath, 'utf-8');
          sessions.push(JSON.parse(data) as ResearchSession);
        }
      }
      
      // Sort by start time (newest first)
      return sessions.sort((a, b) => {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      });
    } catch (error) {
      console.error('Error reading sessions:', error);
      return [];
    }
  }
  
  // Save feedback
  async saveFeedback(feedback: ResearchFeedback): Promise<ResearchFeedback> {
    const filePath = path.join(FEEDBACK_DIR, `${feedback.sessionId}.json`);
    const data = JSON.stringify(feedback, null, 2);
    
    await fs.promises.writeFile(filePath, data, 'utf-8');
    return feedback;
  }
  
  // Get feedback for a session
  async getFeedback(sessionId: string): Promise<ResearchFeedback | null> {
    const filePath = path.join(FEEDBACK_DIR, `${sessionId}.json`);
    
    try {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data) as ResearchFeedback;
    } catch (error) {
      return null;
    }
  }
  
  // Get all feedback
  async getAllFeedback(): Promise<ResearchFeedback[]> {
    try {
      const files = await fs.promises.readdir(FEEDBACK_DIR);
      const feedback: ResearchFeedback[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(FEEDBACK_DIR, file);
          const data = await fs.promises.readFile(filePath, 'utf-8');
          feedback.push(JSON.parse(data) as ResearchFeedback);
        }
      }
      
      // Sort by creation time (newest first)
      return feedback.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (error) {
      console.error('Error reading feedback:', error);
      return [];
    }
  }
  
  // Save audio recording
  async saveAudio(recording: AudioRecording): Promise<AudioRecording> {
    // Save metadata
    const metadataFilePath = path.join(AUDIO_DIR, `${recording.sessionId}-metadata.json`);
    const metadata = { ...recording };
    delete (metadata as any).audioData; // Remove audio data from metadata
    await fs.promises.writeFile(metadataFilePath, JSON.stringify(metadata, null, 2), 'utf-8');
    
    // Save audio data
    if (recording.audioData) {
      const audioFilePath = path.join(AUDIO_DIR, recording.fileName);
      // Convert base64 data to buffer and save
      const audioBuffer = Buffer.from(recording.audioData.split(',')[1], 'base64');
      await fs.promises.writeFile(audioFilePath, audioBuffer);
    }
    
    return recording;
  }
  
  // Get audio recording metadata
  async getAudioMetadata(sessionId: string): Promise<AudioRecording | null> {
    const filePath = path.join(AUDIO_DIR, `${sessionId}-metadata.json`);
    
    try {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data) as AudioRecording;
    } catch (error) {
      return null;
    }
  }
  
  // Get all sessions with their associated feedback
  async getSessionsWithFeedback(): Promise<Array<ResearchSession & { feedback?: ResearchFeedback }>> {
    const sessions = await this.getAllSessions();
    const result = [];
    
    for (const session of sessions) {
      const feedback = await this.getFeedback(session.id);
      result.push({
        ...session,
        feedback: feedback || undefined
      });
    }
    
    return result;
  }
}

export const researchStorage = new ResearchStorage();