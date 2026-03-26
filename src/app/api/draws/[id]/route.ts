import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  try {
    const { data: results, error } = await supabase
      .from('draw_results')
      .select('*')
      .eq('draw_id', id)
      .order('matched_count', { ascending: false }) // Show 5-match, then 4-match, then 3-match

    if (error) throw error

    return NextResponse.json({ results: results ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}