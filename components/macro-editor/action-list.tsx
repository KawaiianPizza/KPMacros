"use client"

import { useState } from "react"
import { useMacroEditor } from "@/contexts/macro-editor-context"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import ActionDisplay from "./action-display"
import { ScrollArea } from "../ui/scroll-area"
import type { MacroAction } from "@/lib/types"

interface ActionListProps {
  listType: "start" | "loop" | "finish"
  title?: string
  description?: string
  compact?: boolean
}

export default function ActionList({ listType, title, description, compact = false }: ActionListProps) {
  const { macro, addAction, updateAction, removeAction, reorderActions } = useMacroEditor()
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const actions = macro[listType]

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const items = Array.from(actions)
    reorderActions(listType, [items[index - 1], items[index]] = [items[index], items[index - 1]])
  }

  const handleMoveDown = (index: number) => {
    if (index >= actions.length - 1) return
    const items = Array.from(actions)
    reorderActions(listType, [items[index], items[index + 1]] = [items[index + 1], items[index]])
  }

  const handleDuplicateAction = (action: MacroAction) => {
    const { id, ...actionWithoutId } = action
    addAction(listType, actionWithoutId)
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

      <div className="flex-1 min-h-0 h-full w-full overflow-hidden">
        <Droppable droppableId={`${listType}-actions`}>
          {(provided, snapshot) => (
            <ScrollArea className="h-96 w-full">
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 min-h-48 transition-colors w-full overflow-hidden ${snapshot.isDraggingOver ? "bg-primary/65 rounded-md" : ""
                  }`}
              >
                {actions.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-md text-foreground/65 text-sm">
                    {snapshot.isDraggingOver ? "Drop action here" : "No actions added yet"}
                  </div>
                ) : (
                  actions.map((action, index) => (
                    <Draggable key={action.id} draggableId={action.id} index={index}>
                      {(provided) => (
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
                        />
                      )}
                    </Draggable>
                  ))
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
