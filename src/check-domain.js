import { useState, useEffect, useMemo } from 'react'
import { isEnsDomainAvailable } from './aragonjs-wrapper'

const DOMAIN_CHECK = Symbol('DOMAIN_CHECK')
const DOMAIN_LOADING = Symbol('DOMAIN_LOADING')
const DOMAIN_ERROR = Symbol('DOMAIN_ERROR')
const DOMAIN_NONE = Symbol('DOMAIN_NONE')

function completeDomain(domain) {
  return domain.endsWith('.eth') ? domain : `${domain}.aragonid.eth`
}

function useCheckDomain(domain, invertCheck = false) {
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setExists(false)
    setLoading(true)

    let cancelled = false

    const check = async () => {
      try {
        const available = await isEnsDomainAvailable(completeDomain(domain))
        if (!cancelled) {
          setExists(available)
          setLoading(false)
        }
      } catch (err) {
        // retry every second
        setTimeout(check, 1000)
      }
    }

    // Only start checking after 300ms
    setTimeout(() => {
      if (!cancelled) {
        check()
      }
    }, 300)

    return () => {
      cancelled = true
    }
  }, [domain])

  const domainStatus = useMemo(() => {
    if (!domain) {
      return DOMAIN_NONE
    }
    if (loading) {
      return DOMAIN_LOADING
    }
    return invertCheck === exists ? DOMAIN_CHECK : DOMAIN_ERROR
  }, [domain, exists, invertCheck, loading])

  return domainStatus
}

export {
  DOMAIN_CHECK,
  DOMAIN_ERROR,
  DOMAIN_LOADING,
  DOMAIN_NONE,
  useCheckDomain,
  completeDomain,
}
