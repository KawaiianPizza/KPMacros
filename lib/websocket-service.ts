"use client"

import type { WebSocketMessage } from "./types"

type MessageHandler = (data: any) => void

class WebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: Map<string, MessageHandler[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private priorityQueue: { action: string; data: any }[] = []
  private isProcessingQueue = false
  private isConnecting = false

  constructor() {
    if (typeof window !== "undefined") {
      this.connect()
    }
  }

  private addToQueue(action: string, data: any): void {
    // Theme-related messages go to the front of the queue
    if (action === "getTheme" || action === "getThemes") {
      this.priorityQueue.unshift({ action, data })
    } else {
      this.priorityQueue.push({ action, data })
    }

    this.processQueue()
  }

  private processQueue(): void {
    if (this.isProcessingQueue || this.priorityQueue.length === 0 || this.socket?.readyState !== WebSocket.OPEN) {
      return
    }

    this.isProcessingQueue = true

    try {
      const { action, data } = this.priorityQueue.shift()!
      const message: WebSocketMessage = { action, data }
      const messageStr = JSON.stringify(message)

      if (messageStr.length > 1000) {
        console.log(`Sending large WebSocket message (${messageStr.length} bytes) for action: ${action}`)
      }

      this.socket!.send(messageStr)
    } catch (error) {
      console.error("Error processing WebSocket queue:", error)
      if (this.priorityQueue.length === 0) {
        console.log("Re-queuing failed message")
      }
    } finally {
      this.isProcessingQueue = false

      if (this.priorityQueue.length > 0) {
        setTimeout(() => this.processQueue(), 10)
      }
    }
  }

  private connect(): void {
    if (this.isConnecting) return

    this.isConnecting = true

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const host = window.location.host

      const wsUrl = process?.env?.NODE_ENV === "development" ? "http://localhost:3001/" : `${protocol}//${host}/`

      console.log(`WebSocket connecting to ${wsUrl}`)
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = this.handleOpen.bind(this)
      this.socket.onmessage = this.handleMessage.bind(this)
      this.socket.onclose = this.handleClose.bind(this)
      this.socket.onerror = this.handleError.bind(this)
    } catch (error) {
      console.error("Error connecting to WebSocket:", error)
      this.isConnecting = false
      this.attemptReconnect()
    }
  }

  private handleOpen(): void {
    console.log("WebSocket connection established")
    this.reconnectAttempts = 0
    this.isConnecting = false

    this.processQueue()
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      this.dispatchMessage(message)
    } catch (error) {
      console.error("Error parsing WebSocket message:", error)
    }
  }

  private handleClose(): void {
    console.log("WebSocket connection closed")
    window.close()
    this.isConnecting = false
    this.attemptReconnect()
  }

  private handleError(error: Event): void {
    console.error("WebSocket error:", error)
    this.isConnecting = false
    this.socket?.close()
  }

  private dispatchMessage(message: WebSocketMessage): void {
    const { action, data } = message
    const handlers = this.messageHandlers.get(action) || []
    handlers.forEach((handler) => {
      try {
        handler(data)
      } catch (error) {
        console.error(`Error in handler for action "${action}":`, error)
      }
    })
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  public send(action: string, data: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.addToQueue(action, data)
    } else {
      this.priorityQueue.push({ action, data })

      if (action === "batchUpdateMacros") {
        console.log(`Queuing batch update for ${data.macros?.length || 0} macros`)
      } else {
        console.log({ [action]: data })
      }

      if (!this.socket || this.socket.readyState >= WebSocket.CLOSING) {
        this.connect()
      }
    }
  }

  public on(action: string, callback: MessageHandler): void {
    if (!this.messageHandlers.has(action)) {
      this.messageHandlers.set(action, [])
    }
    this.messageHandlers.get(action)?.push(callback)
  }

  public off(action: string, callback: MessageHandler): void {
    if (this.messageHandlers.has(action)) {
      const handlers = this.messageHandlers.get(action) || []
      const index = handlers.indexOf(callback)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    this.isConnecting = false
  }
}

const websocketService = typeof window !== "undefined" ? new WebSocketService() : null

export default websocketService
