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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
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
      
      this.mediaRecorder.onstop = () => {
        if (this.currentSession) {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.currentSession.audioBlob = audioBlob;
          
          // Upload the audio to the server
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = reader.result;
            try {
              // Send the audio data to the server
              const response = await fetch('/api/research/audio', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sessionId: this.currentSession!.sessionId,
                  fileName: `${this.currentSession!.sessionId}.webm`,
                  mimeType: 'audio/webm',
                  fileSize: audioBlob.size,
                  audioData: base64data
                })
              });
              
              if (response.ok) {
                console.log('Audio data saved to server successfully');
              } else {
                console.error('Failed to save audio data to server:', await response.text());
              }
            } catch (error) {
              console.error('Error sending audio data to server:', error);
            }
          };
        }
        resolve();
      };
      
      this.mediaRecorder.stop();
      
      // Stop tracks to release the microphone
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
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