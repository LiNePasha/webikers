import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <svg
            width="140"
            height="140"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="45" fill="#BD8D1D" />
            <text
              x="50"
              y="65"
              fontSize="40"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
            >
              AS
            </text>
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
