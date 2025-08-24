import * as amplitude from '@amplitude/analytics-browser'

class AmplitudeService {
  private initialized = false
  private initPromise: Promise<void> | null = null

  async init() {
    if (this.initialized) return
    if (this.initPromise) return this.initPromise

    this.initPromise = this._initAsync()
    return this.initPromise
  }

  private async _initAsync() {
    try {
      const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY
      
      if (!apiKey) {
        console.warn('Amplitude API key not found. Analytics will be disabled.')
        return
      }

      // Initialize with minimal config first
      await amplitude.init(apiKey, undefined, {
        // Disable automatic tracking initially to prevent blocking
        defaultTracking: false,
        // Use batch mode to prevent blocking requests
        flushIntervalMillis: 30000,
        flushQueueSize: 30,
        flushMaxRetries: 2,
        // Disable autocapture initially
        autocapture: false,
        // Set a timeout for initialization
        serverUrl: 'https://api2.amplitude.com/2/httpapi',
      }).promise

      // Enable tracking after successful init (non-blocking)
      setTimeout(() => {
        amplitude.setOptOut(false)
        console.log('Amplitude tracking enabled')
      }, 100)

      this.initialized = true
      console.log('Amplitude initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Amplitude:', error)
      // Don't throw - let the app continue without analytics
    }
  }

  identify(userId: string, userProperties?: Record<string, any>) {
    if (!this.initialized) return
    
    try {
      amplitude.setUserId(userId)
      if (userProperties) {
        amplitude.identify(new amplitude.Identify().setOnce('first_used', new Date().toISOString()))
        amplitude.identify(new amplitude.Identify().set(userProperties))
      }
    } catch (error) {
      console.error('Amplitude identify error:', error)
    }
  }

  track(eventName: string, eventProperties?: Record<string, any>) {
    if (!this.initialized) return
    
    try {
      amplitude.track(eventName, eventProperties)
    } catch (error) {
      console.error('Amplitude track error:', error)
    }
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized) return
    
    try {
      amplitude.identify(new amplitude.Identify().set(properties))
    } catch (error) {
      console.error('Amplitude setUserProperties error:', error)
    }
  }

  reset() {
    if (!this.initialized) return
    
    try {
      amplitude.reset()
    } catch (error) {
      console.error('Amplitude reset error:', error)
    }
  }
}

export const amplitudeService = new AmplitudeService()

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  amplitudeService.track(eventName, properties)
}

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  amplitudeService.identify(userId, properties)
}