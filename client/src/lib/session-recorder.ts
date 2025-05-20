// Session recording service

interface RecordingOptions {
  recordAudio: boolean;
  recordSession: boolean;
}

interface UserAction {
  type: 'click' | 'navigation' | 'input' | 'focus' | 'blur' | 'scroll';
  target: string;
  timestamp: number;
  path: string;
  metadata?: any;
}

interface RecordingSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  userActions: UserAction[];
  audioBlob?: Blob;
  feedbackText?: string;
  feedbackRating?: number;
  userEmail?: string;
}

class SessionRecorder {
  private static instance: SessionRecorder;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: BlobPart[] = [];
  private currentSession: RecordingSession | null = null;
  private options: RecordingOptions = { recordAudio: false, recordSession: false };
  private isRecording = false;
  private clickListener: ((e: MouseEvent) => void) | null = null;
  private navigationListener: ((e: PopStateEvent) => void) | null = null;

  private constructor() {}

  public static getInstance(): SessionRecorder {
    if (!SessionRecorder.instance) {
      SessionRecorder.instance = new SessionRecorder();
    }
    return SessionRecorder.instance;
  }

  public async startRecording(options: RecordingOptions): Promise<boolean> {
    this.options = options;
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      userActions: []
    };
    
    try {
      if (options.recordAudio) {
        await this.startAudioRecording();
      }
      
      if (options.recordSession) {
        this.startSessionTracking();
      }
      
      this.isRecording = true;
      console.log('Session recording started', this.currentSession.sessionId);
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  public async stopRecording(): Promise<RecordingSession | null> {
    if (!this.currentSession || !this.isRecording) return null;
    
    try {
      if (this.options.recordAudio && this.mediaRecorder) {
        await this.stopAudioRecording();
      }
      
      if (this.options.recordSession) {
        this.stopSessionTracking();
      }
      
      this.currentSession.endTime = Date.now();
      this.isRecording = false;
      
      const sessionData = { ...this.currentSession };
      
      // Store session data locally
      sessionStorage.setItem(`splitstay_session_${this.currentSession.sessionId}`, 
        JSON.stringify(sessionData));
      
      // Send session data to server
      try {
        const response = await fetch('/api/research/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionData)
        });
        
        if (response.ok) {
          console.log('Session data saved to server successfully');
        } else {
          console.error('Failed to save session data to server:', await response.text());
        }
      } catch (serverError) {
        console.error('Error sending session data to server:', serverError);
      }
      
      console.log('Session recording completed', this.currentSession.sessionId);
      return sessionData;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      return null;
    }
  }

  public async addFeedback(feedback: { 
    text?: string; 
    rating?: number; 
    email?: string;
    wouldUse?: boolean;
    knowsOthersWhoWouldUse?: boolean;
  }): Promise<void> {
    if (!this.currentSession) return;
    
    if (feedback.text) {
      this.currentSession.feedbackText = feedback.text;
    }
    
    if (feedback.rating) {
      this.currentSession.feedbackRating = feedback.rating;
    }
    
    if (feedback.email) {
      this.currentSession.userEmail = feedback.email;
    }
    
    // Update the stored session data locally
    if (this.currentSession.sessionId) {
      sessionStorage.setItem(`splitstay_session_${this.currentSession.sessionId}`, 
        JSON.stringify(this.currentSession));
    }
    
    // Send feedback data to server
    try {
      const feedbackData = {
        sessionId: this.currentSession.sessionId,
        feedbackText: feedback.text,
        rating: feedback.rating,
        contactEmail: feedback.email,
        wouldUse: feedback.wouldUse,
        knowsOthersWhoWouldUse: feedback.knowsOthersWhoWouldUse,
        createdAt: new Date()
      };
      
      const response = await fetch('/api/research/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });
      
      if (response.ok) {
        console.log('Feedback data saved to server successfully');
      } else {
        console.error('Failed to save feedback data to server:', await response.text());
      }
    } catch (serverError) {
      console.error('Error sending feedback data to server:', serverError);
    }
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  private async startAudioRecording(): Promise<void> {
    try {
      // Request access with a more specific constraint that works better across browsers
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioChunks = [];
      
      // Create the media recorder with specific MIME type that's widely supported
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      // Add event listener for data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
        }
      };
      
      // Start recording with 1 second timeslices to ensure we get data even for short recordings
      this.mediaRecorder.start(1000);
      console.log('Audio recording started successfully');
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      throw error;
    }
  }

  private async stopAudioRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No media recorder'));
        return;
      }
      
      // Handle stopping the recording
      this.mediaRecorder.onstop = async () => {
        try {
          console.log(`Audio recording stopped, processing ${this.audioChunks.length} chunks`);
          
          if (this.currentSession && this.audioChunks.length > 0) {
            // Create an audio blob with the correct MIME type
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
            this.currentSession.audioBlob = audioBlob;
            
            console.log(`Created audio blob, size: ${audioBlob.size} bytes`);
            
            // Create a unique filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `recording-${this.currentSession.sessionId}-${timestamp}.webm`;
            
            // Read the blob as data URL (base64)
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            
            reader.onloadend = async () => {
              try {
                const base64data = reader.result;
                console.log('Audio data converted to base64, sending to server...');
                
                // Send the audio data to the server
                const response = await fetch('/api/research/audio', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    sessionId: this.currentSession!.sessionId,
                    fileName: fileName,
                    mimeType: 'audio/webm;codecs=opus',
                    fileSize: audioBlob.size,
                    audioData: base64data
                  })
                });
                
                if (response.ok) {
                  console.log('Audio data saved to server successfully!');
                } else {
                  const errorText = await response.text();
                  console.error('Failed to save audio data to server:', errorText);
                  // We still resolve because the recording was stopped successfully
                  // even if the server save failed
                }
                resolve();
              } catch (error) {
                console.error('Error sending audio data to server:', error);
                // We still resolve because the recording was stopped successfully
                resolve();
              }
            };
            
            reader.onerror = (error) => {
              console.error('Error reading audio data:', error);
              resolve(); // Still resolve to allow UI to update
            };
          } else {
            console.warn('No audio chunks recorded or session is null');
            resolve();
          }
        } catch (error) {
          console.error('Error processing recorded audio:', error);
          resolve(); // Still resolve to allow UI to update
        }
      };
      
      // Request one final chunk of data before stopping
      this.mediaRecorder.requestData();
      
      // Stop the recording
      this.mediaRecorder.stop();
      
      // Stop tracks to release the microphone
      this.mediaRecorder.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Audio track stopped and released');
      });
    });
  }

  private startSessionTracking(): void {
    // Track clicks
    this.clickListener = (e: MouseEvent) => {
      if (!this.currentSession) return;
      
      // Get target information
      const target = e.target as HTMLElement;
      const action: UserAction = {
        type: 'click',
        target: this.getElementDescription(target),
        timestamp: Date.now(),
        path: window.location.pathname,
        metadata: {
          clientX: e.clientX,
          clientY: e.clientY,
          elementText: target.textContent?.slice(0, 50)
        }
      };
      
      this.currentSession.userActions.push(action);
    };
    
    // Track navigation
    this.navigationListener = (e: PopStateEvent) => {
      if (!this.currentSession) return;
      
      const action: UserAction = {
        type: 'navigation',
        target: 'window',
        timestamp: Date.now(),
        path: window.location.pathname,
        metadata: {
          from: document.referrer,
          to: window.location.href
        }
      };
      
      this.currentSession.userActions.push(action);
    };
    
    document.addEventListener('click', this.clickListener);
    window.addEventListener('popstate', this.navigationListener);
    
    // Record initial page load
    if (this.currentSession) {
      this.currentSession.userActions.push({
        type: 'navigation',
        target: 'initial',
        timestamp: Date.now(),
        path: window.location.pathname,
        metadata: {
          url: window.location.href
        }
      });
    }
  }

  private stopSessionTracking(): void {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
      this.clickListener = null;
    }
    
    if (this.navigationListener) {
      window.removeEventListener('popstate', this.navigationListener);
      this.navigationListener = null;
    }
  }

  private getElementDescription(element: HTMLElement): string {
    // Get a useful description of the element
    const id = element.id ? `#${element.id}` : '';
    const classes = Array.from(element.classList).map(c => `.${c}`).join('');
    const tagName = element.tagName.toLowerCase();
    
    if (id) return `${tagName}${id}`;
    if (classes) return `${tagName}${classes}`;
    
    // If it's a button or link, try to get its text
    if (tagName === 'button' || tagName === 'a') {
      return `${tagName}[${element.textContent?.slice(0, 20) || 'unknown'}]`;
    }
    
    return tagName;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const sessionRecorder = SessionRecorder.getInstance();