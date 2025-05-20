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
    console.log('Received feedback data:', feedbackData);
    
    // Generate a session ID if not provided
    if (!feedbackData.sessionId) {
      feedbackData.sessionId = `direct-feedback-${Date.now()}`;
      console.log('Generated new session ID:', feedbackData.sessionId);
    }
    
    // Add timestamp if not provided
    if (!feedbackData.createdAt) {
      feedbackData.createdAt = new Date();
    }
    
    const savedFeedback = await researchStorage.saveFeedback(feedbackData);
    console.log('Feedback saved successfully:', savedFeedback);
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
    console.log('Received audio recording data:', { 
      sessionId: recordingData.sessionId,
      fileName: recordingData.fileName,
      mimeType: recordingData.mimeType,
      fileSize: recordingData.fileSize,
      hasAudioData: !!recordingData.audioData
    });
    
    // Validate required fields
    if (!recordingData.fileName || !recordingData.audioData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate a session ID if not provided
    if (!recordingData.sessionId) {
      recordingData.sessionId = `audio-recording-${Date.now()}`;
      console.log('Generated new session ID for audio:', recordingData.sessionId);
    }
    
    // Create a simple session if one doesn't exist
    const session = await researchStorage.getSession(recordingData.sessionId);
    if (!session) {
      const newSession = {
        id: recordingData.sessionId,
        startTime: new Date(),
        recordedActions: [],
        hasAudioRecording: true
      };
      await researchStorage.saveSession(newSession);
      console.log('Created new session for audio recording:', newSession.id);
    } else if (!session.hasAudioRecording) {
      // Update existing session to indicate it has audio
      session.hasAudioRecording = true;
      await researchStorage.saveSession(session);
    }
    
    const savedRecording = await researchStorage.saveAudio(recordingData);
    console.log('Audio recording saved successfully for session:', recordingData.sessionId);
    
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