'use client'

interface MemberAvatarProps {
  photoUrl?: string | null  // if set, treated as a signal to show photo (actual src is the proxy)
  memberId?: string          // if set, fetches that member's photo (coach use)
  name?: string
  size?: number              // px
  className?: string
}

export function MemberAvatar({ photoUrl, memberId, name, size = 32, className = '' }: MemberAvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  // Build proxy src — avoids S3 domain allow-listing and keeps bucket private
  const proxySrc = memberId
    ? `/api/member/photo/serve?memberId=${memberId}&t=${encodeURIComponent(photoUrl ?? '')}`
    : photoUrl
    ? `/api/member/photo/serve?t=${encodeURIComponent(photoUrl)}`
    : null

  if (proxySrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={proxySrc}
        alt={name ?? 'Member photo'}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fall back to initials avatar on error
          const target = e.currentTarget
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            const div = document.createElement('div')
            div.className = `rounded-full bg-red-600 flex items-center justify-center font-montserrat font-bold shrink-0 ${className}`
            div.style.cssText = `width:${size}px;height:${size}px;font-size:${Math.round(size * 0.38)}px`
            div.textContent = initials
            parent.appendChild(div)
          }
        }}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-red-600 flex items-center justify-center font-montserrat font-bold text-white shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials}
    </div>
  )
}
