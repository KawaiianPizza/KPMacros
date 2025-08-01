"use client"

import { Component, ReactElement, useEffect, useMemo, useRef, useState } from "react"
import { useMacroEditor } from "@/contexts/macro-editor-context"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import ActionDisplay from "./action-display"
import { ScrollArea } from "../ui/scroll-area"
import type { MacroAction } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { cn } from "@/lib/utils"

interface ActionListProps {
  listType: "start" | "loop" | "finish"
  title?: string
  description?: string
  compact?: boolean
}

export default function ActionList({ listType, title, description, compact = false }: ActionListProps) {
  const { macro, addAction, updateAction, removeAction, reorderActions, lastAddedActionId, setLastAddedActionId } = useMacroEditor()
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const actions = useMemo(() => macro[listType], [macro[listType]])
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: "nearest" })
      setLastAddedActionId("")
    }
  }, [actions])

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const items = Array.from(actions);[items[index - 1], items[index]] = [items[index], items[index - 1]]
    reorderActions(listType, items)
  }

  const handleMoveDown = (index: number) => {
    if (index >= actions.length - 1) return
    const items = Array.from(actions);[items[index], items[index + 1]] = [items[index + 1], items[index]]
    reorderActions(listType, items)
  }

  const handleDuplicateAction = (action: MacroAction) => {
    const { id, ...actionWithoutId } = action
    addAction(listType, { ...actionWithoutId, id: uuidv4() })
  }

  const handleSelectAction = (actionId: string) => {
    setSelectedActionId(selectedActionId === actionId ? null : actionId)
  }

  return (
    <div className="space-y-4 h-full flex flex-col w-full overflow-hidden">
      {title && description && !compact && (
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">{title}</h4>
          <p className="text-xs text-foreground/65">{description}</p>
        </div>
      )}

      <div className="flex-1 min-h-0 h-full w-full relative border border-border p-1 rounded-lg bg-background before:absolute before:inset-0 before:bg-card/35 overflow-clip">
        <Droppable droppableId={`${listType}-actions`}>
          {(provided, snapshot) => (
            <ScrollArea className={cn("h-96 w-full",
              listType === "loop" && "h-[21.25rem]"
            )} scrollHideDelay={1000 * 60 * 60 * 24}>
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-1 min-h-48 transition-colors w-full ${snapshot.isDraggingOver ? "bg-input/65 rounded-md" : ""
                  }`}
              >
                {actions.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-md text-foreground/65 text-sm">
                    {snapshot.isDraggingOver ? "Drop action here" : "No actions added yet"}
                  </div>
                ) : (
                  actions.map((action, index) =>
                    <Draggable key={action.id} draggableId={action.id} index={index}>
                      {(provided) => {
                        const isLastAdded = action.id === lastAddedActionId;
                        return (
                          <div
                            ref={node => {
                              if (isLastAdded) lastMessageRef.current = node;
                              provided.innerRef(node);
                            }}
                          >
                            <ActionDisplay
                              action={action}
                              index={index}
                              listType={listType}
                              isSelected={selectedActionId === action.id}
                              onSelect={() => handleSelectAction(action.id)}
                              onUpdate={(updates) => updateAction(listType, action.id, updates)}
                              onMoveUp={() => handleMoveUp(index)}
                              onMoveDown={() => handleMoveDown(index)}
                              onDuplicate={() => handleDuplicateAction(action)}
                              onDelete={() => removeAction(listType, action.id)}
                              dragHandleProps={provided.dragHandleProps}
                              provided={provided}
                              className={cn("!animate-update-border")}
                            />
                          </div>);
                      }}
                    </Draggable>
                  )
                )}
                {provided.placeholder}
              </div>
            </ScrollArea>
          )}
        </Droppable>
      </div>
    </div>
  )
}
