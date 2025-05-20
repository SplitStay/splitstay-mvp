import { Router } from 'express';
import { researchStorage } from './research-storage';
import { ResearchSession, ResearchFeedback, AudioRecording } from '@shared/research-types';

const router = Router();

// Save a session recording
router.post('/api/research/session', async (req, res) => {
  try {
    const sessionData = req.body as ResearchSession;
    
    // Validate required fields
    if (!sessionData.id || !sessionData.startTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const savedSession = await researchStorage.saveSession(sessionData);
    res.status(201).json(savedSession);
  } catch (error) {
    console.error('Error saving research session:', error);
    res.status(500).json({ error: 'Failed to save research session' });
  }
});

// Save feedback for a session
router.post('/api/research/feedback', async (req, res) => {
  try {
    const feedbackData = req.body as ResearchFeedback;
    
    // Validate session ID
    if (!feedbackData.sessionId) {
      return res.status(400).json({ error: 'Missing session ID' });
    }
    
    // Check if the session exists
    const session = await researchStorage.getSession(feedbackData.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Add timestamp if not provided
    if (!feedbackData.createdAt) {
      feedbackData.createdAt = new Date();
    }
    
    const savedFeedback = await researchStorage.saveFeedback(feedbackData);
    res.status(201).json(savedFeedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// Save audio recording
router.post('/api/research/audio', async (req, res) => {
  try {
    const recordingData = req.body as AudioRecording;
    
    // Validate required fields
    if (!recordingData.sessionId || !recordingData.fileName || !recordingData.audioData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if the session exists
    const session = await researchStorage.getSession(recordingData.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Update the session to indicate it has audio
    if (!session.hasAudioRecording) {
      session.hasAudioRecording = true;
      await researchStorage.saveSession(session);
    }
    
    const savedRecording = await researchStorage.saveAudio(recordingData);
    
    // Don't return the audio data in the response
    const response = { ...savedRecording };
    delete (response as any).audioData;
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error saving audio recording:', error);
    res.status(500).json({ error: 'Failed to save audio recording' });
  }
});

// Get all research data for admin view
router.get('/api/research/data', async (req, res) => {
  try {
    const sessionsWithFeedback = await researchStorage.getSessionsWithFeedback();
    res.json(sessionsWithFeedback);
  } catch (error) {
    console.error('Error fetching research data:', error);
    res.status(500).json({ error: 'Failed to fetch research data' });
  }
});

// Get audio file for a session
router.get('/api/research/audio/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const metadata = await researchStorage.getAudioMetadata(sessionId);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Audio recording not found' });
    }
    
    res.sendFile(metadata.fileName, { root: './research-data/audio' });
  } catch (error) {
    console.error('Error fetching audio:', error);
    res.status(500).json({ error: 'Failed to fetch audio recording' });
  }
});

export default router;