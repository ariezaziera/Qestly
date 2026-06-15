import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { geocodeLocation } from '@/lib/geocode'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: apps } = await supabase
      .from('applications')
      .select('id, location')
      .eq('user_id', user.id)
      .is('latitude', null)
      .not('location', 'is', null)

    if (!apps?.length) return NextResponse.json({ updated: 0 })

    let updated = 0
    for (const app of apps) {
      const geo = await geocodeLocation(app.location)
      if (geo) {
        await supabase
          .from('applications')
          .update({
            latitude: geo.isRemote ? null : geo.latitude,
            longitude: geo.isRemote ? null : geo.longitude,
            is_remote: geo.isRemote,
          })
          .eq('id', app.id)
        updated++
      }
      // Throttle — Nominatim policy: max 1 req/sec
      await new Promise(r => setTimeout(r, 1100))
    }

    return NextResponse.json({ updated, total: apps.length })
  } catch (err) {
    return NextResponse.json({ error: 'Backfill failed.' }, { status: 500 })
  }
}