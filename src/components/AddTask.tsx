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
    const [priority, setPriority] = React.useState("medium")
    const [date, setDate] = React.useState<Date>()
    const [loading, setLoading] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title) return
        setLoading(true)

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase
                .from('tasks')
                .insert({
                    title,
                    priority,
                    due_date: date?.toISOString(),
                    user_id: user.id
                } as any)

            if (!error) {
                setTitle("")
                setPriority("medium")
                setDate(undefined)
                onSuccess()
            } else {
                console.error(error)
            }
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className={cn("grid items-start gap-4", className)}>
            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="Buy groceries"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="date">Due Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Task"}
            </Button>
        </form>
    )
}
