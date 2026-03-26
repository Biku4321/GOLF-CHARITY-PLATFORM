import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const claimSchema = z.object({
  proof_url: z.string().url('Must be a valid URL'),
  claim_id:  z.string().uuid().optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body   = await req.json()
    const parsed = claimSchema.parse(body)

    const { data: profile } = await supabase
      .from('profiles').select('id').eq('auth_user_id', user.id).single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let claimId = parsed.claim_id

    // If no claim_id provided, find most recent pending claim for this user
    if (!claimId) {
      const { data: pendingClaim } = await supabase
        .from('winner_claims')
        .select('id')
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()

      if (!pendingClaim) {
        return NextResponse.json(
          { error: 'No pending claim found for your account' },
          { status: 404 }
        )
      }
      claimId = pendingClaim.id
    } else {
      // Verify claim belongs to this user
      const { data: existing } = await supabase
        .from('winner_claims')
        .select('id, user_id, status')
        .eq('id', claimId)
        .single()

      if (!existing) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
      if (existing.user_id !== profile.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      if (existing.status !== 'pending') {
        return NextResponse.json({ error: `Claim is already ${existing.status}` }, { status: 409 })
      }
    }

    // Update proof_url — status stays 'pending' until admin reviews
    const { data, error } = await supabase
      .from('winner_claims')
      .update({
        proof_url:    parsed.proof_url,
        submitted_at: new Date().toISOString(),
        // Status stays 'pending' — admin will approve/reject
      })
      .eq('id', claimId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ claim: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 })
  }
}