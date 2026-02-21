'use client'

import * as React from 'react'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { supabase } from '@/lib/supabase'

export function AddTask({ onTaskAdded }: { onTaskAdded: () => void }) {
    const [open, setOpen] = React.useState(false)
    const isDesktop = React.useSyncExternalStore(
        () => () => { },
        () => typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false,
        () => false
    )

    const handleSuccess = () => { setOpen(false); onTaskAdded() }

    // Floating Action Button
    const FAB = (
        <button
            className="w-14 h-14 rounded-full flex items-center justify-center fixed bottom-7 right-6 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
                background: 'var(--sage)',
                color: 'var(--paper)',
                boxShadow: '0 8px 24px rgba(123,137,111,0.35)',
            }}
        >
            <Plus size={24} strokeWidth={2.5} />
        </button>
    )

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{FAB}</DialogTrigger>
                <DialogContent
                    className="sm:max-w-[420px] border-none p-0 overflow-hidden rounded-[24px]"
                    style={{ background: 'var(--paper)', boxShadow: '0 24px 64px rgba(44,36,22,0.18)' }}
                >
                    <DialogHeader className="px-7 pt-7 pb-4">
                        <DialogTitle className="font-serif text-2xl" style={{ color: 'var(--ink)' }}>
                            New Task
                        </DialogTitle>
                        <p className="font-sans text-sm" style={{ color: 'var(--ink-muted)' }}>
                            What's on your mind?
                        </p>
                    </DialogHeader>
                    <TaskForm className="px-7 pb-7" onSuccess={handleSuccess} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{FAB}</DrawerTrigger>
            <DrawerContent
                className="border-t-0 rounded-t-[28px]"
                style={{ background: 'var(--paper)', boxShadow: '0 -8px 40px rgba(44,36,22,0.12)' }}
            >
                <DrawerHeader className="text-left px-6 pt-6 pb-2">
                    <DrawerTitle className="font-serif text-2xl" style={{ color: 'var(--ink)' }}>
                        New Task
                    </DrawerTitle>
                    <p className="font-sans text-sm" style={{ color: 'var(--ink-muted)' }}>
                        What's on your mind?
                    </p>
                </DrawerHeader>
                <TaskForm className="px-6 pb-2" onSuccess={handleSuccess} />
                <DrawerFooter className="pt-2 px-6 pb-6">
                    <DrawerClose asChild>
                        <button
                            className="w-full py-3 rounded-full font-sans text-sm transition-all duration-200 hover:opacity-70"
                            style={{ color: 'var(--ink-muted)' }}
                        >
                            Cancel
                        </button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function TaskForm({ className, onSuccess }: { className?: string, onSuccess: () => void }) {
    const [title, setTitle] = React.useState('')
    const [priority, setPriority] = React.useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
    const [categoryId, setCategoryId] = React.useState<string | null>(null)
    const [categories, setCategories] = React.useState<{ id: string, name: string, color: string }[]>([])
    const [date, setDate] = React.useState<Date>()
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        supabase.from('categories').select('*').then(({ data }: { data: { id: string, name: string, color: string }[] | null }) => { if (data) setCategories(data) })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { error } = await supabase.from('tasks').insert({
                title,
                priority,
                due_date: date?.toISOString(),
                category_id: categoryId,
                user_id: user.id
            } as any)
            if (!error) {
                setTitle(''); setPriority('medium'); setDate(undefined); setCategoryId(null)
                onSuccess()
            } else {
                console.error(error)
            }
        }
        setLoading(false)
    }

    const priorities = [
        { value: 'low', label: 'Low', dot: '#8C7D6B' },
        { value: 'medium', label: 'Medium', dot: '#7B896F' },
        { value: 'high', label: 'High', dot: '#C49A3C' },
        { value: 'urgent', label: 'Urgent', dot: '#C97070' },
    ]

    return (
        <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)}>
            {/* Title (blank-page input style) */}
            <div className="border-b" style={{ borderColor: 'var(--border)' }}>
                <input
                    type="text"
                    placeholder="What needs to get done?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    className="w-full bg-transparent py-3 font-sans text-lg outline-none placeholder:opacity-30 transition-colors duration-200"
                    style={{ color: 'var(--ink)', caretColor: 'var(--sage)' }}
                    onFocus={e => (e.target.parentElement!.style.borderColor = 'var(--sage)')}
                    onBlur={e => (e.target.parentElement!.style.borderColor = 'var(--border)')}
                />
            </div>

            {/* Priority Selector */}
            <div>
                <p className="font-sans text-xs uppercase tracking-widest mb-2.5" style={{ color: 'var(--ink-muted)' }}>
                    Priority
                </p>
                <div
                    className="flex p-1 rounded-full"
                    style={{ background: 'var(--secondary)' }}
                >
                    {priorities.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => setPriority(p.value as any)}
                            className="flex-1 py-2 text-xs font-sans font-medium rounded-full transition-all duration-200 flex items-center justify-center gap-1.5"
                            style={{
                                background: priority === p.value ? 'var(--paper)' : 'transparent',
                                color: priority === p.value ? 'var(--ink)' : 'var(--ink-muted)',
                                boxShadow: priority === p.value ? '0 2px 8px rgba(44,36,22,0.10)' : 'none',
                            }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category selector */}
            {categories.length > 0 && (
                <div>
                    <p className="font-sans text-xs uppercase tracking-widest mb-2.5" style={{ color: 'var(--ink-muted)' }}>
                        Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setCategoryId(null)}
                            className="px-3 py-1.5 rounded-full font-sans text-xs transition-all duration-200"
                            style={{
                                background: !categoryId ? 'var(--sage-light)' : 'var(--secondary)',
                                color: !categoryId ? 'var(--sage)' : 'var(--ink-muted)',
                                border: !categoryId ? '1px solid var(--sage-muted)' : '1px solid transparent',
                            }}
                        >
                            None
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategoryId(cat.id)}
                                className="px-3 py-1.5 rounded-full font-sans text-xs flex items-center gap-1.5 transition-all duration-200"
                                style={{
                                    background: categoryId === cat.id ? `${cat.color}18` : 'var(--secondary)',
                                    color: categoryId === cat.id ? cat.color : 'var(--ink-muted)',
                                    border: categoryId === cat.id ? `1px solid ${cat.color}50` : '1px solid transparent',
                                }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Date Picker */}
            <div>
                <p className="font-sans text-xs uppercase tracking-widest mb-2.5" style={{ color: 'var(--ink-muted)' }}>
                    Due Date
                </p>
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="w-full flex items-center gap-2 py-2.5 px-4 rounded-2xl font-sans text-sm text-left transition-all duration-200 hover:opacity-80"
                            style={{
                                background: 'var(--secondary)',
                                color: date ? 'var(--ink)' : 'var(--ink-muted)',
                            }}
                        >
                            <CalendarIcon size={15} />
                            {date ? format(date, 'PPP') : <span>Pick a date</span>}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0 border-none rounded-2xl overflow-hidden"
                        style={{ background: 'var(--paper)', boxShadow: '0 8px 32px rgba(44,36,22,0.14)' }}
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || !title.trim()}
                className="w-full py-3.5 rounded-full font-sans font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                style={{
                    background: 'var(--sage)',
                    color: 'var(--paper)',
                    boxShadow: '0 4px 16px rgba(123,137,111,0.3)',
                }}
            >
                {loading ? 'Adding…' : 'Add Task'}
            </button>
        </form>
    )
}
