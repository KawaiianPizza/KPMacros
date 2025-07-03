"use client"

import { useEffect, useCallback, useRef, useMemo, useState } from "react"
import websocketService from "@/lib/websocket-service"
import { useToast } from "./use-toast"

type MessageHandler = (data: any) => void

export function useWebSocketUI() {
  const { toast } = useToast()
  const handlersRef = useRef<Map<string, MessageHandler[]>>(new Map())
  const cooldownRefs = useRef<Map<string, number>>(new Map())
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    return () => {
      cooldownRefs.current?.clear()
    }
  }, [])

  const send = useCallback((action: string, data: any) => {
    if (websocketService) {
      const currentTime = Date.now();
      const lastActionTime = cooldownRefs.current?.get(action);

      if (!lastActionTime || currentTime - lastActionTime >= 100) {
        websocketService.send(action, data);
        cooldownRefs.current.set(action, currentTime);
      }
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

  useEffect(() => {
    if (!isClosed) return

    toast({
      title: "WebSocket connection closed",
      description: "Please reopen the editor from the tray",
      variant: "destructive",
    })
  }, [isClosed])
  if (websocketService)
    websocketService.onCloseCallback = () => setIsClosed(true)

  return { send, on, off }
}
