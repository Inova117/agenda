'use client'

import * as React from "react"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
// import { useMediaQuery } from "@/hooks/use-media-query" // We don't have this yet, I'll implement a simple one or just use one component
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { supabase } from "@/lib/supabase"

export function AddTask({ onTaskAdded }: { onTaskAdded: () => void }) {
    const [open, setOpen] = React.useState(false)
    const isDesktop = React.useSyncExternalStore(
        () => () => { },
        () => typeof window !== 'undefined' ? window.matchMedia("(min-width: 768px)").matches : false,
        () => false
    )

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" className="h-14 w-14 rounded-full shadow-lg fixed bottom-6 right-6">
                        <Plus className="h-6 w-6" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Task</DialogTitle>
                        <DialogDescription>
                            What do you need to get done?
                        </DialogDescription>
                    </DialogHeader>
                    <TaskForm className="px-0" onSuccess={() => { setOpen(false); onTaskAdded() }} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button size="icon" className="h-14 w-14 rounded-full shadow-lg fixed bottom-6 right-6">
                    <Plus className="h-6 w-6" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Add Task</DrawerTitle>
                    <DrawerDescription>
                        What do you need to get done?
                    </DrawerDescription>
                </DrawerHeader>
                <TaskForm className="px-4" onSuccess={() => { setOpen(false); onTaskAdded() }} />
                <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function TaskForm({ className, onSuccess }: { className?: string, onSuccess: () => void }) {
    const [title, setTitle] = React.useState("")
    const [priority, setPriority] = React.useState<"low" | "medium" | "high" | "urgent">("medium")
    const [categoryId, setCategoryId] = React.useState<string | null>(null)
    const [categories, setCategories] = React.useState<{ id: string, name: string, color: string }[]>([])
    const [date, setDate] = React.useState<Date>()
    const [loading, setLoading] = React.useState(false)

    // Fetch categories on mount
    React.useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('*')
            if (data) setCategories(data)
        }
        fetchCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title) return
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase
                .from('tasks')
                .insert({
                    title,
                    priority,
                    due_date: date?.toISOString(),
                    category_id: categoryId,
                    user_id: user.id
                } as any)

            if (!error) {
                setTitle("")
                setPriority("medium")
                setDate(undefined)
                setCategoryId(null)
                onSuccess()
            } else {
                console.error(error)
            }
        }
        setLoading(false)
    }

    const priorities = [
        { value: "low", label: "Low", color: "bg-zinc-500" },
        { value: "medium", label: "Medium", color: "bg-blue-500" },
        { value: "high", label: "High", color: "bg-orange-500" },
        { value: "urgent", label: "Urgent", color: "bg-red-500" },
    ]

    return (
        <form onSubmit={handleSubmit} className={cn("grid items-start gap-6", className)}>
            <div className="grid gap-2">
                <Label htmlFor="title" className="text-zinc-400">Task Name</Label>
                <Input
                    id="title"
                    placeholder="Create a new task..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    className="border-none bg-white/5 text-lg h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-zinc-700"
                />
            </div>

            <div className="grid gap-2">
                <Label className="text-zinc-400">Priority</Label>
                <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
                    {priorities.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            onClick={() => setPriority(p.value as any)}
                            className={cn(
                                "flex-1 py-2 text-xs font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5",
                                priority === p.value
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            <div className={cn("w-1.5 h-1.5 rounded-full", p.color)} />
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-2">
                <Label className="text-zinc-400">Due Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal bg-white/5 border-white/5 rounded-2xl h-12 hover:bg-white/10 hover:text-white",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            className="text-white"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <Button type="submit" disabled={loading} className="h-12 rounded-2xl bg-white text-black hover:bg-zinc-200 mt-2 font-bold">
                {loading ? "Adding..." : "Add Task"}
            </Button>
        </form>
    )
}
