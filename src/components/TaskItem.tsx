import { Task } from '@/lib/supabase'
import { motion, useMotionValue, useTransform } from 'framer-motion'
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
    const x = useMotionValue(0)
    // Optimized ranges to avoid clamping calculations where possible
    const deleteOpacity = useTransform(x, [60, 100], [0, 1])
    const deleteScale = useTransform(x, [60, 100], [0.8, 1.2])
    const completeOpacity = useTransform(x, [-60, -100], [0, 1])
    const completeScale = useTransform(x, [-60, -100], [0.8, 1.2])

    const handleDragEnd = (event: any, info: any) => {
        const offset = info.offset.x
        const threshold = 50 // Lowered for easier activation

        console.log('Drag ended:', { offset, threshold })

        if (offset > threshold) {
            console.log('Delete action triggered')
            onDelete(task.id)
        } else if (offset < -threshold) {
            console.log('Toggle action triggered', { taskId: task.id, currentStatus: task.is_completed })
            onToggle(task.id, task.is_completed)
        }
    }

    return (
        <div className="relative mb-3 group">
            {/* Background Actions Layer */}
            <div className="absolute inset-0 flex items-center justify-between rounded-3xl overflow-hidden px-4">
                {/* Delete Action (Visible when sliding Right) */}
                <div className="flex items-center justify-start w-full h-full bg-red-500/20 rounded-3xl pl-6">
                    <motion.div style={{ opacity: deleteOpacity, scale: deleteScale }} className="flex items-center gap-2">
                        <Trash2 className="text-red-500" size={24} />
                        <span className="font-bold text-red-500 text-sm tracking-widest uppercase">Delete</span>
                    </motion.div>
                </div>

                {/* Complete Action (Visible when sliding Left) */}
                <div className="absolute inset-0 flex items-center justify-end w-full h-full bg-green-500/20 rounded-3xl pr-6">
                    <motion.div style={{ opacity: completeOpacity, scale: completeScale }} className="flex items-center gap-2">
                        <span className="font-bold text-green-500 text-sm tracking-widest uppercase">
                            {task.is_completed ? "Undo" : "Done"}
                        </span>
                        <Check className="text-green-500" size={24} />
                    </motion.div>
                </div>
            </div>

            {/* Foreground Card */}
            <motion.div
                style={{ x, willChange: "transform" }}
                drag="x"
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileTap={{ cursor: "grabbing" }}
                className={cn(
                    "relative flex items-center justify-between p-5 rounded-3xl transition-colors duration-300 z-10",
                    task.is_completed
                        ? "bg-black/40 border border-white/5 opacity-50"
                        : "bg-zinc-900 border border-white/5 shadow-sm"
                )}
            >
                <div className="flex items-center gap-4 flex-1 select-none">
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

                {/* Desktop Hover Actions */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(task.id, !task.is_completed) }}
                        className="p-2 rounded-full hover:bg-green-500/20 text-zinc-400 hover:text-green-500 transition-colors"
                        title={task.is_completed ? "Undo" : "Done"}
                    >
                        <Check size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
                        className="p-2 rounded-full hover:bg-red-500/20 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    )
})

export default TaskItem
