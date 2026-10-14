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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  // Admin only
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { memberId } = await params

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { gapDocumentUrl: true, firstName: true, lastName: true },
  })

  if (!member?.gapDocumentUrl) {
    return NextResponse.json({ error: 'No document on file' }, { status: 404 })
  }

  const key = member.gapDocumentUrl

  // If it's still an old /tmp path (legacy records), return a clear error
  if (key.startsWith('/tmp') || key.startsWith('/var')) {
    return NextResponse.json(
      { error: 'Document was stored locally during development and is no longer accessible. Please ask the member to re-upload.' },
      { status: 410 }
    )
  }

  try {
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn: 300 } // 5 min — enough to open, not shareable long-term
    )
    return NextResponse.redirect(url)
  } catch (err) {
    console.error('[gap/document] S3 error:', err)
    return NextResponse.json({ error: 'Could not retrieve document' }, { status: 500 })
  }
}
