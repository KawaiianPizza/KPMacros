"use client"

import { useEffect, useCallback, useRef, useMemo, useState } from "react"
import websocketService from "@/lib/websocket-service"
import { useToast } from "./use-toast"

type MessageHandler = (data: any) => void

type CooldownEntry = {
  lastSent?: number;
  timeoutId?: ReturnType<typeof setTimeout>;
};

export function useWebSocketUI() {
  const { toast } = useToast()
  const handlersRef = useRef<Map<string, MessageHandler[]>>(new Map())
  const cooldownRefs = useRef<Map<string, CooldownEntry>>(new Map())
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    return () => {
      cooldownRefs.current?.clear()
    }
  }, [])

  const COOLDOWN_MS = 300;

  const send = useCallback((action: string, data: any, debounce: boolean = true) => {
    if (!websocketService) return;

    const now = Date.now();
    const entry = cooldownRefs.current.get(action) || {};
    const timeSinceLastSend = entry.lastSent ? now - entry.lastSent : Infinity;

    if (debounce) {
      if (timeSinceLastSend < COOLDOWN_MS) {
        if (entry.timeoutId) clearTimeout(entry.timeoutId);

        const timeoutId = setTimeout(() => {
          websocketService?.send(action, data);
          cooldownRefs.current.set(action, { lastSent: Date.now(), });
        }, COOLDOWN_MS - timeSinceLastSend);

        cooldownRefs.current.set(action, { ...entry, timeoutId, });
        return;
      }

      websocketService.send(action, data);
      cooldownRefs.current.set(action, { lastSent: now, });
      return
    }

    if (timeSinceLastSend <= COOLDOWN_MS) return

    websocketService.send(action, data);
    cooldownRefs.current.set(action, { lastSent: now, });
  }, []);


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
