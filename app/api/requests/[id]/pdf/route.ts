import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { LetterDocument } from '@/lib/pdf/generator'
import React from 'react'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify request ownership
  const { data: req } = await supabase
    .from('requests')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!req) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const { content, subject } = body as { content: string; subject?: string }

  try {
    const buffer = await renderToBuffer(
      React.createElement(LetterDocument, { content, subject })
    )

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="lettre-dealwithit-${id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
