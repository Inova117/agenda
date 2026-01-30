import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import webpush from 'https://esm.sh/web-push@3.6.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
    try {
        const now = new Date()
        const bufferMinutes = 5
        const pastLimit = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
        const futureLimit = new Date(now.getTime() + bufferMinutes * 60 * 1000).toISOString()

        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*, push_subscriptions(*)')
            .eq('is_completed', false)
            .gte('due_date', pastLimit)
            .lte('due_date', futureLimit)

        if (tasksError) throw tasksError

        const { data: sent, error: sentError } = await supabase
            .from('sent_notifications')
            .select('task_id')
            .in('task_id', tasks.map(t => t.id))

        if (sentError) throw sentError

        const sentIds = new Set(sent?.map(s => s.task_id))
        const tasksToSend = tasks.filter(t => !sentIds.has(t.id))

        const results = []

        for (const task of tasksToSend) {
            if (!task.push_subscriptions || task.push_subscriptions.length === 0) continue

            const payload = JSON.stringify({
                title: `Reminder: ${task.title}`,
                body: `This task is due! Priority: ${task.priority}`,
                icon: '/icon-192.png',
                url: '/'
            })

            const vapidKeys = {
                publicKey: Deno.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY')!,
                privateKey: Deno.env.get('VAPID_PRIVATE_KEY')!,
            }

            webpush.setVapidDetails(
                'mailto:admin@example.com',
                vapidKeys.publicKey,
                vapidKeys.privateKey
            )

            for (const sub of task.push_subscriptions) {
                try {
                    const pushConfig = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    }
                    await webpush.sendNotification(pushConfig, payload)
                    results.push({ task: task.title, status: 'sent' })
                } catch (err) {
                    console.error('Push error:', err)
                    if (err.statusCode === 410) {
                        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
                    }
                }
            }

            await supabase.from('sent_notifications').insert({ task_id: task.id })
        }

        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        return new Response(String(err), { status: 500 })
    }
})
