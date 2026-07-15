"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import type { Chapter, Verse } from "@/types/quran"

interface SurahPayload {
  chapter: Chapter
  verses: Verse[]
}

interface SurahContentContextValue {
  chapter: Chapter | null
  verses: Verse[]
  surahId: number | null
  pendingSurahId: number | null
  targetAyahId: number | undefined
  isLoading: boolean
  loadSurah: (id: number) => void
  prefetchSurah: (id: number) => void
  hydrate: (payload: SurahPayload & { targetAyahId?: number }) => void
}

const SurahContentContext = createContext<SurahContentContextValue | null>(null)

function parseSurahId(pathname: string): number | null {
  const match = pathname.match(/^\/(\d+)(?:\/|$)/)
  if (!match) return null
  const id = Number(match[1])
  return id >= 1 && id <= 114 ? id : null
}

export function SurahContentProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [verses, setVerses] = useState<Verse[]>([])
  const [surahId, setSurahId] = useState<number | null>(null)
  const [pendingSurahId, setPendingSurahId] = useState<number | null>(null)
  const [targetAyahId, setTargetAyahId] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const cacheRef = useRef<Map<number, SurahPayload>>(new Map())
  const inflightRef = useRef<Map<number, Promise<SurahPayload>>>(new Map())
  const hydratedRef = useRef(false)
  const loadingRef = useRef(false)

  const fetchSurah = useCallback(async (id: number): Promise<SurahPayload> => {
    const cached = cacheRef.current.get(id)
    if (cached) return cached

    const inflight = inflightRef.current.get(id)
    if (inflight) return inflight

    const request = fetch(`/api/surah/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Surah ${id} failed to load`)
        return res.json() as Promise<SurahPayload>
      })
      .then((data) => {
        cacheRef.current.set(id, data)
        inflightRef.current.delete(id)
        return data
      })
      .catch((err) => {
        inflightRef.current.delete(id)
        throw err
      })

    inflightRef.current.set(id, request)
    return request
  }, [])

  const applyPayload = useCallback(
    (payload: SurahPayload, nextTargetAyahId?: number) => {
      setChapter(payload.chapter)
      setVerses(payload.verses)
      setSurahId(payload.chapter.id)
      setTargetAyahId(nextTargetAyahId)
      hydratedRef.current = true
    },
    [],
  )

  const hydrate = useCallback(
    (payload: SurahPayload & { targetAyahId?: number }) => {
      cacheRef.current.set(payload.chapter.id, {
        chapter: payload.chapter,
        verses: payload.verses,
      })
      applyPayload(payload, payload.targetAyahId)
    },
    [applyPayload],
  )

  const prefetchSurah = useCallback(
    (id: number) => {
      void fetchSurah(id).catch(() => undefined)
      router.prefetch(`/${id}`)
    },
    [fetchSurah, router],
  )

  const loadSurah = useCallback(
    (id: number) => {
      if (loadingRef.current) return
      if (id === surahId && verses.length > 0) return

      loadingRef.current = true
      setIsLoading(true)
      setPendingSurahId(id)
      setTargetAyahId(undefined)
      router.push(`/${id}`, { scroll: false })

      void fetchSurah(id)
        .then((payload) => {
          applyPayload(payload)
        })
        .catch(() => undefined)
        .finally(() => {
          loadingRef.current = false
          setIsLoading(false)
          setPendingSurahId(null)
        })
    },
    [applyPayload, fetchSurah, router, surahId, verses.length],
  )

  useEffect(() => {
    const id = parseSurahId(pathname)
    if (!id || !hydratedRef.current || id === surahId || loadingRef.current) return

    loadingRef.current = true
    setIsLoading(true)
    setPendingSurahId(id)
    setTargetAyahId(undefined)

    void fetchSurah(id)
      .then((payload) => {
        applyPayload(payload)
      })
      .catch(() => undefined)
      .finally(() => {
        loadingRef.current = false
        setIsLoading(false)
        setPendingSurahId(null)
      })
  }, [pathname, surahId, fetchSurah, applyPayload])

  return (
    <SurahContentContext.Provider
      value={{
        chapter,
        verses,
        surahId,
        pendingSurahId,
        targetAyahId,
        isLoading,
        loadSurah,
        prefetchSurah,
        hydrate,
      }}
    >
      {children}
    </SurahContentContext.Provider>
  )
}

export function useSurahContent() {
  const ctx = useContext(SurahContentContext)
  if (!ctx) throw new Error("useSurahContent must be used within SurahContentProvider")
  return ctx
}

export function useSurahContentOptional() {
  return useContext(SurahContentContext)
}
