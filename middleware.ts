import { NextRequest, NextResponse } from 'next/server'

const getProtocol = (): string =>
  process.env.NODE_ENV === 'production' ? 'https://' : 'http://'

type Middleware = (req: NextRequest) => NextResponse

// Hack to read proper headers from the request, without this host will always be "localhost", even on production. Its unsafe because host may be forged
// https://github.com/vercel/next.js/issues/37536
function withHostFromHeaders(middleware: Middleware) {
  return (...args: any[]) => {
    let { nextUrl, headers, url } = args[0]

    nextUrl.host = headers.get('Host') ?? nextUrl.host
    url = nextUrl.href

    // @ts-expect-error
    return middleware(...args)
  }
}

export default withHostFromHeaders((req: NextRequest): NextResponse => {
  const hostname = req.headers.get('host')

  if (!hostname) {
    return NextResponse.next()
  }

  const domainKey = hostname.split('.')[0]

  // There's no subdomain so continue
  if (!domainKey || domainKey === hostname) {
    return NextResponse.next()
  }

  // Safeguard to not redirect on these URLs (eg. app.example.com)
  if (['www', 'app', 'dev', 'stg', 'vercel', 'example'].includes(domainKey)) {
    return NextResponse.next()
  }

  // Remove domainKey from hostname
  const origin = hostname.replace(`${domainKey}.`, '')

  const signInUrl = `${getProtocol()}${origin}/signin?domainKey=${domainKey}`

  // this will be correct Url
  // on production https://app.example.com/signin?domainKey=foobar
  // on locahost http://localhost:3000/signin?domainKey=foobar
  console.log({ signInUrl })

  return NextResponse.redirect(signInUrl)
})

// Run only on index (eg. foobar.example.com)
export const config = {
  matcher: ['/'],
}
