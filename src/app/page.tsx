'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"
import { AddTask } from "@/components/AddTask"
import TaskItem from "@/components/TaskItem"
import { PushNotificationManager } from "@/components/PushNotificationManager"
import { supabase } from "@/lib/supabase" // usage of the singleton
import { format } from "date-fns"

export default function Home() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])

  const fetchTasks = useCallback(async () => {
    if (!session?.user) return

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('is_completed', { ascending: true }) // uncompleted first
      .order('due_date', { ascending: true })     // then by date
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else {
      setTasks(data || [])
    }
  }, [session])

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (mounted) {
          setSession(session)
          if (!session) {
            router.push('/login')
          }
        }
      } catch (error) {
        console.error("Auth session error:", error)
        // Even on error, stop loading so user isn't stuck
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (mounted) {
        setSession(session)
        if (!session) {
          router.push('/login')
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session, fetchTasks])

  const handleToggleTask = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t))

    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus } as any)
      .eq('id', id)

    if (error) {
      // Revert on error
      fetchTasks()
    }
  }

  const handleDeleteTask = async (id: string) => {
    // Optimistic update
    setTasks(tasks.filter(t => t.id !== id))

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      fetchTasks()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">Loading...</div>
  }

  if (!session) {
    return null
  }

  const activeTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 p-4 backdrop-blur-md dark:bg-zinc-900/80 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Today</h1>
          <p className="text-sm text-zinc-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="flex items-center gap-2">
          <PushNotificationManager />
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-zinc-500" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div className="space-y-6">
          <div className="space-y-3">
            {activeTasks.length === 0 && completedTasks.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <p>No tasks yet.</p>
                <p className="text-sm">Add one to get started!</p>
              </div>
            ) : null}

            {/* New UI elements for Journal - Apple Style Header */}
            <div className="flex items-center justify-between mb-6 pt-6">
              <div>
                <h1 className="text-4xl font-serif font-bold tracking-tight text-white/90 mb-1">
                  Journal
                </h1>
                <p className="text-zinc-500 font-sans text-lg">
                  {format(new Date(), 'EEEE, MMMM do')}
                </p>
              </div>
              <PushNotificationManager />
            </div>

            {/* Subtle top glow instead of blob */}
            <div className="fixed top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-zinc-900/20 to-transparent pointer-events-none" />

            {activeTasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
            ))}
          </div>

          {completedTasks.length > 0 && (
            <div className="pt-4">
              <h2 className="text-sm font-medium text-zinc-500 mb-3 px-1">Completed</h2>
              <div className="space-y-3 opacity-60">
                {completedTasks.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <AddTask onTaskAdded={fetchTasks} />
    </div>
  );
}
