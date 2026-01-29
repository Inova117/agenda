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
                "group relative flex items-center justify-between p-5 rounded-3xl mb-3 transition-all duration-300",
                task.is_completed
                    ? "bg-transparent border border-white/5 opacity-50"
                    : "bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-sm"
            )}
        >
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggle(task.id, !task.is_completed)
                    }}
                    className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300",
                        task.is_completed
                            ? "bg-red-500 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                            : "border-zinc-500 hover:border-red-400 bg-transparent"
                    )}
                >
                    {task.is_completed && <Check size={14} strokeWidth={3} />}
                </button>

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
