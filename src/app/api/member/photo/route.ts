import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_S3_BUCKET ?? 'hbfit-uploads'

// GET — return current photoUrl
export async function GET() {
  const session = await getSession()
  if (!session?.user) return NextResponse.json(null, { status: 401 })

  const member = await prisma.member.findFirst({
    where: { user: { email: { equals: session.user.email, mode: 'insensitive' } } },
    select: { photoUrl: true },
  })
  return NextResponse.json({ photoUrl: member?.photoUrl ?? null })
}

// POST — return a presigned upload URL
export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contentType } = await req.json().catch(() => ({ contentType: 'image/jpeg' }))

  // Validate content type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  if (!allowed.includes(contentType)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WebP.' }, { status: 400 })
  }

  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'

  const member = await prisma.member.findFirst({
    where: { user: { email: { equals: session.user.email, mode: 'insensitive' } } },
    select: { id: true },
  })
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  const key = `member-photos/${member.id}.${ext}`

  const command = new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    ContentType: contentType,
    CacheControl: 'max-age=31536000',
  })

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const photoUrl  = `https://${BUCKET}.s3.${process.env.AWS_REGION ?? 'us-east-1'}.amazonaws.com/${key}`

  return NextResponse.json({ uploadUrl, photoUrl, key })
}

// PATCH — confirm upload and save photoUrl to DB
export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { photoUrl } = await req.json()
  if (!photoUrl || typeof photoUrl !== 'string') {
    return NextResponse.json({ error: 'photoUrl required' }, { status: 400 })
  }

  // Basic validation — must be our S3 bucket
  if (!photoUrl.includes(BUCKET)) {
    return NextResponse.json({ error: 'Invalid photo URL' }, { status: 400 })
  }

  await prisma.member.updateMany({
    where: { user: { email: { equals: session.user.email, mode: 'insensitive' } } },
    data:  { photoUrl },
  })

  return NextResponse.json({ ok: true, photoUrl })
}

// DELETE — remove photo
export async function DELETE() {
  const session = await getSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await prisma.member.findFirst({
    where: { user: { email: { equals: session.user.email, mode: 'insensitive' } } },
    select: { id: true, photoUrl: true },
  })
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  // Delete from S3 if exists
  if (member.photoUrl) {
    try {
      const url = new URL(member.photoUrl)
      const key = url.pathname.slice(1) // strip leading /
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
    } catch { /* ignore — URL may be malformed or already deleted */ }
  }

  await prisma.member.update({
    where: { id: member.id },
    data:  { photoUrl: null },
  })

  return NextResponse.json({ ok: true })
}
