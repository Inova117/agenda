import { Task } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Check, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { memo } from 'react'

interface TaskItemProps {
    task: Task
    onToggle: (id: string, completed: boolean) => void
    onDelete: (id: string) => void
}

const TaskItem = memo(function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    // We use a motion value to track drag position if we want dynamic opacity (optional), 
    // but for now simple onDragEnd logic is cleaner.

    const handleDragEnd = (event: any, info: any) => {
        const offset = info.offset.x
        const threshold = 100

        if (offset > threshold) {
            // Swiped Right -> Delete
            onDelete(task.id)
        } else if (offset < -threshold) {
            // Swiped Left -> Toggle Complete
            onToggle(task.id, !task.is_completed)
        }
    }

    return (
        <div className="relative mb-3 group">
            {/* Background Actions Layer */}
            <div className="absolute inset-0 flex items-center justify-between rounded-3xl overflow-hidden px-4">
                {/* Delete Action (Visible when sliding Right) */}
                <div className="flex items-center justify-start w-full h-full bg-red-500/20 rounded-3xl pl-6">
                    <Trash2 className="text-red-500" size={24} />
                    <span className="ml-2 font-bold text-red-500 text-sm tracking-widest uppercase">Delete</span>
                </div>

                {/* Complete Action (Visible when sliding Left) - Absolute positioned to be on right */}
                <div className="absolute inset-0 flex items-center justify-end w-full h-full bg-green-500/20 rounded-3xl pr-6">
                    <span className="mr-2 font-bold text-green-500 text-sm tracking-widest uppercase">
                        {task.is_completed ? "Undo" : "Done"}
                    </span>
                    <Check className="text-green-500" size={24} />
                </div>
            </div>

            {/* Foreground Card */}
            <motion.div
                layout
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ cursor: "grabbing" }}
                style={{ willChange: "transform" }}
                className={cn(
                    "relative flex items-center justify-between p-5 rounded-3xl transition-colors duration-300 z-10",
                    task.is_completed
                        ? "bg-black/40 border border-white/5 opacity-50"
                        : "bg-zinc-900 border border-white/5 shadow-sm"
                )}
            >
                <div className="flex items-center gap-4 flex-1 pointer-events-none select-none">
                    {/* Visual Checkbox (Non-interactive, just status) */}
                    <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300 shrink-0",
                        task.is_completed
                            ? "bg-red-500 border-red-500 text-white"
                            : "border-zinc-500 bg-transparent"
                    )}>
                        {task.is_completed && <Check size={14} strokeWidth={3} />}
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <span className={cn(
                            "text-lg font-sans font-medium transition-all duration-300",
                            task.is_completed ? "text-zinc-600 line-through" : "text-zinc-100"
                        )}>
                            {task.title}
                        </span>

                        <div className="flex items-center gap-3 text-xs text-zinc-500 font-sans">
                            {task.due_date && (
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} className="text-zinc-600" />
                                    <span>{format(new Date(task.due_date), 'MMM d')}</span>
                                </div>
                            )}

                            {task.category_id && task.categories && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.categories.color }} />
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                                        {task.categories.name}
                                    </span>
                                </div>
                            )}

                            {task.priority && task.priority !== 'low' && (
                                <div className="flex items-center gap-1">
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        task.priority === 'urgent' ? "bg-red-500" :
                                            task.priority === 'high' ? "bg-orange-500" :
                                                "bg-yellow-500"
                                    )} />
                                    <span className="capitalize">{task.priority}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
})

export default TaskItem
