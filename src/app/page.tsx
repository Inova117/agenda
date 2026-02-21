'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { AddTask } from '@/components/AddTask'
import TaskItem from '@/components/TaskItem'
import { PushNotificationManager } from '@/components/PushNotificationManager'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<any[]>([])

  const fetchTasks = useCallback(async () => {
    if (!session?.user) return
    const { data, error } = await supabase
      .from('tasks')
      .select('*, categories(name, color)')
      .order('is_completed', { ascending: true })
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false })
    if (!error) setTasks(data || [])
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
          } else {
            const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true })
            if (count === 0) {
              await supabase.from('categories').insert([
                { user_id: session.user.id, name: 'Personal', color: '#7B896F' },
                { user_id: session.user.id, name: 'Work', color: '#8B7355' },
                { user_id: session.user.id, name: 'Ideas', color: '#7B896F' },
                { user_id: session.user.id, name: 'Errands', color: '#C97070' }
              ])
            }
          }
        }
      } catch (error) {
        console.error('Auth session error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    checkSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (mounted) {
        setSession(session)
        if (!session) router.push('/login')
      }
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [router])

  useEffect(() => {
    if (session) fetchTasks()
  }, [session, fetchTasks])

  const handleToggleTask = useCallback(async (id: string, currentStatus: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t))
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus } as any)
      .eq('id', id)
    if (error) fetchTasks()
  }, [fetchTasks])

  const handleDeleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) fetchTasks()
  }, [fetchTasks])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const activeTasks = useMemo(() => tasks.filter(t => !t.is_completed), [tasks])
  const completedTasks = useMemo(() => tasks.filter(t => t.is_completed), [tasks])

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: 'var(--cream)' }}
      >
        <div className="text-center">
          <p className="font-serif text-2xl mb-1" style={{ color: 'var(--ink)' }}>Agenda</p>
          <p className="font-sans text-sm" style={{ color: 'var(--ink-muted)' }}>Loading your sanctuary…</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div
      className="flex min-h-screen flex-col pb-28"
      style={{ background: 'var(--cream)' }}
    >
      {/* Subtle warm ambient glow at top */}
      <div
        className="fixed top-0 left-0 right-0 h-64 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(123,137,111,0.07) 0%, transparent 80%)' }}
      />

      {/* Main Content */}
      <main className="flex-1 px-5 max-w-2xl mx-auto w-full pt-14 relative z-10">

        {/* Journal Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none mb-2" style={{ color: 'var(--ink)' }}>
              Journal
            </h1>
            <p className="font-sans text-base" style={{ color: 'var(--ink-muted)' }}>
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <PushNotificationManager />
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 hover:opacity-70 active:scale-95"
              style={{ color: 'var(--ink-muted)' }}
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <div className="text-center py-24">
            <p className="font-serif text-xl mb-1" style={{ color: 'var(--ink-muted)' }}>All caught up.</p>
            <p className="font-sans text-sm" style={{ color: 'var(--ink-muted)', opacity: 0.6 }}>Tap + to add your first task.</p>
          </div>
        )}

        {/* Active Tasks */}
        <div className="space-y-0">
          <AnimatePresence mode="popLayout">
            {activeTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="mt-8">
            <p
              className="font-sans text-xs uppercase tracking-widest mb-3 px-1"
              style={{ color: 'var(--ink-muted)', opacity: 0.6 }}
            >
              Completed
            </p>
            <div className="space-y-0 opacity-60">
              <AnimatePresence mode="popLayout">
                {completedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      <AddTask onTaskAdded={fetchTasks} />
    </div>
  )
}
