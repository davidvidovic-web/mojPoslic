/**
 * Performance monitoring for messaging system
 * Tracks key metrics to ensure optimization is working
 */

interface PerformanceMetrics {
  apiCalls: number
  cacheHits: number
  cacheMisses: number
  realTimeConnections: number
  messagesSent: number
  messagesReceived: number
  batchedMessages: number
  lastResetTime: Date
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics = {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    realTimeConnections: 0,
    messagesSent: 0,
    messagesReceived: 0,
    batchedMessages: 0,
    lastResetTime: new Date()
  }

  private static readonly RESET_INTERVAL = 60 * 60 * 1000 // Reset every hour
  private static resetTimer: NodeJS.Timeout | null = null

  /**
   * Initialize performance monitoring
   */
  static initialize(): void {
    if (this.resetTimer) return

    this.resetTimer = setInterval(() => {
      this.logMetrics()
      this.resetMetrics()
    }, this.RESET_INTERVAL)

    // Log metrics on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.logMetrics()
      })
    }
  }

  /**
   * Track an API call
   */
  static trackApiCall(): void {
    this.metrics.apiCalls++
  }

  /**
   * Track a cache hit
   */
  static trackCacheHit(): void {
    this.metrics.cacheHits++
  }

  /**
   * Track a cache miss
   */
  static trackCacheMiss(): void {
    this.metrics.cacheMisses++
  }

  /**
   * Track real-time connection
   */
  static trackConnection(): void {
    this.metrics.realTimeConnections++
  }

  /**
   * Track message sent
   */
  static trackMessageSent(): void {
    this.metrics.messagesSent++
  }

  /**
   * Track message received
   */
  static trackMessageReceived(): void {
    this.metrics.messagesReceived++
  }

  /**
   * Track batched messages
   */
  static trackBatchedMessages(count: number): void {
    this.metrics.batchedMessages += count
  }

  /**
   * Get current metrics
   */
  static getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Calculate cache hit rate
   */
  static getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses
    return total > 0 ? (this.metrics.cacheHits / total) * 100 : 0
  }

  /**
   * Get average API calls per minute
   */
  static getApiCallsPerMinute(): number {
    const minutes = (Date.now() - this.metrics.lastResetTime.getTime()) / (1000 * 60)
    return minutes > 0 ? this.metrics.apiCalls / minutes : 0
  }

  /**
   * Log metrics to console for monitoring
   */
  private static logMetrics(): void {
    if (!console || typeof console.log !== 'function') return

    const metrics = this.getMetrics()
    const cacheHitRate = this.getCacheHitRate()
    const apiCallsPerMinute = this.getApiCallsPerMinute()

    console.group('📊 Messaging Performance Metrics')
    console.log(`🔄 API Calls: ${metrics.apiCalls} (${apiCallsPerMinute.toFixed(2)}/min)`)
    console.log(`💾 Cache Hit Rate: ${cacheHitRate.toFixed(1)}% (${metrics.cacheHits}/${metrics.cacheHits + metrics.cacheMisses})`)
    console.log(`🌐 Real-time Connections: ${metrics.realTimeConnections}`)
    console.log(`📤 Messages Sent: ${metrics.messagesSent}`)
    console.log(`📥 Messages Received: ${metrics.messagesReceived}`)
    console.log(`📦 Batched Messages: ${metrics.batchedMessages}`)
    console.log(`⏱️ Period: ${Math.round((Date.now() - metrics.lastResetTime.getTime()) / (1000 * 60))} minutes`)
    
    // Performance status
    if (apiCallsPerMinute < 2) {
      console.log('✅ API Usage: Excellent (< 2 calls/min)')
    } else if (apiCallsPerMinute < 5) {
      console.log('🟡 API Usage: Good (< 5 calls/min)')
    } else {
      console.log('🔴 API Usage: High (> 5 calls/min) - Check optimization')
    }

    if (cacheHitRate > 70) {
      console.log('✅ Cache Performance: Excellent (> 70%)')
    } else if (cacheHitRate > 50) {
      console.log('🟡 Cache Performance: Good (> 50%)')
    } else {
      console.log('🔴 Cache Performance: Poor (< 50%) - Check caching strategy')
    }

    console.groupEnd()
  }

  /**
   * Reset metrics for next period
   */
  private static resetMetrics(): void {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      realTimeConnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      batchedMessages: 0,
      lastResetTime: new Date()
    }
  }

  /**
   * Stop monitoring
   */
  static stop(): void {
    if (this.resetTimer) {
      clearInterval(this.resetTimer)
      this.resetTimer = null
    }
  }

  /**
   * Export metrics for external monitoring (e.g., analytics)
   */
  static exportMetrics(): string {
    const metrics = this.getMetrics()
    return JSON.stringify({
      ...metrics,
      cacheHitRate: this.getCacheHitRate(),
      apiCallsPerMinute: this.getApiCallsPerMinute(),
      timestamp: new Date().toISOString()
    })
  }
}
