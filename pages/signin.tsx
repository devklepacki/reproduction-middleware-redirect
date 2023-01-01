import { useRouter } from 'next/router'
import { useEffect } from 'react'

/** Add your relevant code here for the issue to reproduce */
export default function Signin() {
  const router = useRouter()

  useEffect(() => {
    if (router.isReady) console.log(router.query.domainKey)
  }, [router.isReady])

  return null
}
