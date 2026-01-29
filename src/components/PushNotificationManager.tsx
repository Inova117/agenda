'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { urlBase64ToUint8Array } from '@/lib/utils/pwa'
import { supabase } from '@/lib/supabase'

export function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState<PushSubscription | null>(null)

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
    }

    async function subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.ready
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            })
            setSubscription(sub)

            // Save to Supabase
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('push_subscriptions').upsert({
                    user_id: user.id,
                    endpoint: sub.endpoint,
                    p256dh: sub.toJSON().keys?.p256dh,
                    auth: sub.toJSON().keys?.auth,
                })
            }

            alert('Notifications enabled!')
        } catch (error) {
            console.error(error)
            alert('Failed to enable notifications.')
        }
    }

    if (!isSupported) {
        return null
    }

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                size="icon"
                onClick={subscribeToPush}
                disabled={!!subscription}
                className="rounded-full"
            >
                {subscription ? <Bell className="h-4 w-4 text-green-500" /> : <BellOff className="h-4 w-4" />}
            </Button>
        </div>
    )
}
