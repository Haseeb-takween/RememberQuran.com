import { getChapters } from "@/lib/quranApi"
import { SurahList } from "./SurahList"
import { SidebarContainer } from "./SidebarContainer"

export async function SurahSidebar() {
  const chapters = await getChapters()

  return (
    <SidebarContainer>
      <SurahList chapters={chapters} />
    </SidebarContainer>
  )
}
