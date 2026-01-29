'use client'

import { format } from "date-fns"
import { Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TaskProps {
    task: {
        id: string
        title: string
        is_completed: boolean
        priority: string
        due_date?: string
        category?: {
            name: string
            color: string
        }
    }
    onToggle: (id: string, currentStatus: boolean) => void
    onDelete: (id: string) => void
}

const priorityColors: Record<string, string> = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    urgent: "bg-red-500",
}

export function TaskItem({ task, onToggle, onDelete }: TaskProps) {
    return (
        <Card className={cn(
            "flex items-center p-4 transition-all duration-300",
            task.is_completed ? "opacity-60 bg-zinc-50 dark:bg-zinc-900/50" : "bg-white dark:bg-zinc-900"
        )}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Checkbox
                    checked={task.is_completed}
                    onCheckedChange={() => onToggle(task.id, task.is_completed)}
                    className="rounded-full h-6 w-6 border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <div className="flex flex-col min-w-0">
                    <span className={cn(
                        "text-base font-medium truncate transition-all",
                        task.is_completed && "line-through text-muted-foreground"
                    )}>
                        {task.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {task.due_date && (
                            <span>{format(new Date(task.due_date), "MMM d")}</span>
                        )}
                        {task.priority && (
                            <div className="flex items-center gap-1">
                                <div className={cn("h-2 w-2 rounded-full", priorityColors[task.priority])} />
                                <span className="capitalize">{task.priority}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id)}
                className="text-muted-foreground hover:text-red-500"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </Card>
    )
}
