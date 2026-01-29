import { Task } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Check, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface TaskItemProps {
    task: Task
    onToggle: (id: string, completed: boolean) => void
    onDelete: (id: string) => void
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "group relative flex items-center justify-between p-5 rounded-3xl mb-4 transition-all duration-300",
                task.is_completed
                    ? "bg-zinc-900/50 border border-transparent opacity-60"
                    : "bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20"
            )}
        >
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={() => onToggle(task.id, !task.is_completed)}
                    className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300",
                        task.is_completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-zinc-500 hover:border-primary"
                    )}
                >
                    {task.is_completed && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="flex flex-col">
                    <span className={cn(
                        "text-lg font-sans font-medium transition-all duration-300",
                        task.is_completed ? "text-zinc-500 line-through" : "text-foreground"
                    )}>
                        {task.title}
                    </span>
                </div>
            </div>

            <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-full"
                aria-label="Delete task"
            >
                <Trash2 size={18} />
            </button>
        </motion.div>
    )
}
