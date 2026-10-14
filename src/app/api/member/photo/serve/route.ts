import { NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
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

// Proxy the member's photo from private S3 — returns the image bytes
// Also accepts ?memberId=xxx for coach view
export async function GET(req: Request) {
  const session = await getSession()
  if (!session?.user) return new NextResponse('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const memberId = searchParams.get('memberId')

  let photoUrl: string | null = null

  if (memberId) {
    // Coach fetching another member's photo — verify requester is staff/admin
    const me = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true },
    })
    if (me?.role !== 'COACH' && me?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }
    const m = await prisma.member.findUnique({ where: { id: memberId }, select: { photoUrl: true } })
    photoUrl = m?.photoUrl ?? null
  } else {
    const m = await prisma.member.findFirst({
      where: { user: { email: { equals: session.user.email, mode: 'insensitive' } } },
      select: { photoUrl: true },
    })
    photoUrl = m?.photoUrl ?? null
  }

  if (!photoUrl) return new NextResponse('Not found', { status: 404 })

  // Extract S3 key from stored URL (strip cache-bust query param)
  const clean = photoUrl.split('?')[0]
  const key = clean.replace(`https://${BUCKET}.s3.${process.env.AWS_REGION ?? 'us-east-1'}.amazonaws.com/`, '')

  // Generate a short-lived presigned URL and redirect — browser caches the redirect result
  const signed = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 3600 }
  )

  return NextResponse.redirect(signed)
}
