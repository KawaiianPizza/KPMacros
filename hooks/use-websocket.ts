"use client"

import { useEffect, useCallback, useRef } from "react"
import websocketService from "@/lib/websocket-service"

type MessageHandler = (data: any) => void

export function useWebSocket() {
  const handlersRef = useRef<Map<string, MessageHandler[]>>(new Map())

  const send = useCallback((action: string, data: any) => {
    if (websocketService) {
      websocketService.send(action, data)
    }
  }, [])

  const on = useCallback((action: string, handler: MessageHandler) => {
    if (!websocketService) return

    if (!handlersRef.current.has(action)) {
      handlersRef.current.set(action, [])
    }
    handlersRef.current.get(action)?.push(handler)

    websocketService.on(action, handler)
  }, [])

  const off = useCallback((action: string, handler: MessageHandler) => {
    if (!websocketService) return

    const handlers = handlersRef.current.get(action)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }

    websocketService.off(action, handler)
  }, [])

  useEffect(() => {
    return () => {
      handlersRef.current.forEach((handlers, action) => {
        handlers.forEach((handler) => {
          websocketService?.off(action, handler)
        })
      })
      handlersRef.current.clear()
    }
  }, [])

  return { send, on, off }
}
