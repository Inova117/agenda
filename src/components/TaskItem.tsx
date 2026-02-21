'use client'

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

    // Sage green (done) fades in on left swipe, dusty rose (delete) on right
    const deleteOpacity = useTransform(x, [60, 100], [0, 1])
    const deleteScale = useTransform(x, [60, 100], [0.8, 1.1])
    const completeOpacity = useTransform(x, [-60, -100], [0, 1])
    const completeScale = useTransform(x, [-60, -100], [0.8, 1.1])

    const handleDragEnd = (event: any, info: any) => {
        const offset = info.offset.x
        const threshold = 50

        if (offset > threshold) {
            onDelete(task.id)
        } else if (offset < -threshold) {
            onToggle(task.id, task.is_completed)
        }
    }

    return (
        <div className="relative mb-3 group">
            {/* Background Actions Layer */}
            <div className="absolute inset-0 flex items-center justify-between rounded-[20px] overflow-hidden px-4">
                {/* Delete (Dusty Rose) — slide RIGHT */}
                <div className="flex items-center justify-start w-full h-full rounded-[20px] pl-6"
                    style={{ backgroundColor: 'var(--dusty-rose-light)' }}>
                    <motion.div style={{ opacity: deleteOpacity, scale: deleteScale }} className="flex items-center gap-2">
                        <Trash2 size={20} style={{ color: 'var(--dusty-rose)' }} />
                        <span className="font-sans font-semibold text-sm tracking-wider uppercase" style={{ color: 'var(--dusty-rose)' }}>
                            Delete
                        </span>
                    </motion.div>
                </div>

                {/* Done (Sage Green) — slide LEFT */}
                <div className="absolute inset-0 flex items-center justify-end w-full h-full rounded-[20px] pr-6"
                    style={{ backgroundColor: 'var(--sage-light)' }}>
                    <motion.div style={{ opacity: completeOpacity, scale: completeScale }} className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-sm tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
                            {task.is_completed ? 'Undo' : 'Done'}
                        </span>
                        <Check size={20} style={{ color: 'var(--sage)' }} />
                    </motion.div>
                </div>
            </div>

            {/* Foreground Card */}
            <motion.div
                style={{
                    x,
                    willChange: 'transform',
                    background: 'var(--paper)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(44,36,22,0.06)',
                }}
                drag="x"
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                    'relative flex items-center justify-between px-5 py-4 rounded-[20px] z-10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                    task.is_completed ? 'opacity-50' : ''
                )}
            >
                <div className="flex items-center gap-4 flex-1 select-none">
                    <div className="flex flex-col gap-1">
                        <span
                            className={cn(
                                'font-sans text-base font-medium transition-all duration-300 leading-snug',
                                task.is_completed
                                    ? 'line-through'
                                    : ''
                            )}
                            style={{ color: task.is_completed ? 'var(--ink-muted)' : 'var(--ink)' }}
                        >
                            {task.title}
                        </span>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            {task.due_date && (
                                <div className="flex items-center gap-1" style={{ color: 'var(--ink-muted)' }}>
                                    <Calendar size={11} />
                                    <span className="text-[11px] font-sans">{format(new Date(task.due_date), 'MMM d')}</span>
                                </div>
                            )}

                            {task.category_id && task.categories && (
                                <div
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: `${task.categories.color}18`, border: `1px solid ${task.categories.color}30` }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.categories.color }} />
                                    <span className="text-[10px] uppercase tracking-wider font-sans font-medium" style={{ color: task.categories.color }}>
                                        {task.categories.name}
                                    </span>
                                </div>
                            )}

                            {task.priority && task.priority !== 'low' && (
                                <div className="flex items-center gap-1">
                                    <div className={cn(
                                        'w-1.5 h-1.5 rounded-full',
                                        task.priority === 'urgent' ? 'bg-[var(--dusty-rose)]' :
                                            task.priority === 'high' ? 'bg-orange-400' :
                                                'bg-yellow-500'
                                    )} />
                                    <span className="text-[11px] font-sans capitalize" style={{ color: 'var(--ink-muted)' }}>
                                        {task.priority}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop hover actions */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(task.id, task.is_completed) }}
                        className="p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{ color: 'var(--sage-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage-light)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        title={task.is_completed ? 'Undo' : 'Done'}
                    >
                        <Check size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
                        className="p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{ color: 'var(--dusty-rose)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--dusty-rose-light)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </motion.div>
        </div>
    )
})

export default TaskItem
