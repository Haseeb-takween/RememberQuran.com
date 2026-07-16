export interface TajweedRule {
  label: string
  description: string
}

/**
 * Tajweed rule registry — rules observed from the QDC word_fields=text_uthmani_tajweed
 * probe. Unknown rules from future API updates fall through with no class (safe default:
 * no colour, no error).
 */
export const TAJWEED_RULES: Record<string, TajweedRule> = {
  ham_wasl: { label: "Hamzat al-Wasl", description: "Connecting hamza — silent when preceded by another word" },
  laam_shamsiyah: { label: "Laam Shamsiyyah", description: "The laam is assimilated into the following sun letter" },
  madda_normal: { label: "Madd Normal", description: "Natural elongation of two counts" },
  madda_permissible: { label: "Madd Permissible", description: "Permissible elongation of 2, 4 or 6 counts" },
  madda_necessary: { label: "Madd Necessary", description: "Obligatory elongation of 6 counts" },
  madda_obligatory: { label: "Madd Obligatory", description: "Obligatory elongation — must be 4 or 5 counts" },
  ghunnah: { label: "Ghunnah", description: "Nasalisation — 2-count nasal sound through the nose" },
  qalaqah: { label: "Qalqalah", description: "Echoing sound on a stopped consonant (ق ط ب ج د)" },
  ikhafa: { label: "Ikhfāʾ", description: "Concealment — nasal nun/tanwin before 15 letters" },
  ikhafa_shafawi: { label: "Ikhfāʾ Shafawī", description: "Lip concealment — meem saakin before ba" },
  idgham_ghunnah: { label: "Idghām with Ghunnah", description: "Merging with nasalisation into the next letter" },
  idgham_wo_ghunnah: { label: "Idghām without Ghunnah", description: "Merging without nasalisation" },
  idgham_mutajanisayn: { label: "Idghām Mutajānisayn", description: "Merging of two letters sharing the same articulation point" },
  idgham_mutaqaribayn: { label: "Idghām Mutaqāribayn", description: "Merging of two letters with adjacent articulation points" },
  iqlab: { label: "Iqlāb", description: "Conversion — noon saakin/tanwin becomes meem before ba" },
  slnt: { label: "Silent", description: "Letter is written but not pronounced" },
  "custom-alef-maksora": { label: "Alef Maqsura", description: "Superscript alef on alef maqsura — elongated like a regular alef" },
}

/** All known rule slugs — used by the legend and for safe class generation */
export const KNOWN_RULES = new Set(Object.keys(TAJWEED_RULES))

// --- Parser ---

interface TajweedToken {
  text: string
  rule?: string
}

/** Module-level memoization — O(len) parse happens once per unique word markup string */
const parseCache = new Map<string, TajweedToken[]>()

const OPEN_PREFIX = "<rule class="
const CLOSE_TAG = "</rule>"

/**
 * Split a `text_uthmani_tajweed` word string into colourable segments.
 * Plain text between rule tags gets `rule: undefined` (rendered as-is).
 *
 * Stack tokenizer (not a flat regex) — QDC nests rules, e.g.
 *   `<rule class=madda_normal><rule class=custom-alef-maksora>ٰ</rule></rule>`
 * Innermost known rule wins for each character run. Unknown future classes
 * are pushed but skipped when resolving colour (outer known rule still applies).
 * Never uses innerHTML — attrs are unquoted.
 */
export function parseTajweedWord(text: string): TajweedToken[] {
  const cached = parseCache.get(text)
  if (cached) return cached

  const tokens: TajweedToken[] = []
  const stack: string[] = []

  const activeRule = (): string | undefined => {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (KNOWN_RULES.has(stack[i])) return stack[i]
    }
    return undefined
  }

  const emit = (chunk: string) => {
    if (!chunk) return
    const rule = activeRule()
    const prev = tokens[tokens.length - 1]
    if (prev && prev.rule === rule) {
      prev.text += chunk
    } else {
      tokens.push(rule ? { text: chunk, rule } : { text: chunk })
    }
  }

  let i = 0
  while (i < text.length) {
    if (text.startsWith(OPEN_PREFIX, i)) {
      const gt = text.indexOf(">", i + OPEN_PREFIX.length)
      if (gt === -1) {
        emit(text.slice(i))
        break
      }
      stack.push(text.slice(i + OPEN_PREFIX.length, gt).trim())
      i = gt + 1
      continue
    }

    if (text.startsWith(CLOSE_TAG, i)) {
      stack.pop()
      i += CLOSE_TAG.length
      continue
    }

    const nextOpen = text.indexOf(OPEN_PREFIX, i)
    const nextClose = text.indexOf(CLOSE_TAG, i)
    let next = text.length
    if (nextOpen !== -1) next = Math.min(next, nextOpen)
    if (nextClose !== -1) next = Math.min(next, nextClose)
    emit(text.slice(i, next))
    i = next
  }

  if (tokens.length === 0) tokens.push({ text })

  parseCache.set(text, tokens)
  return tokens
}
