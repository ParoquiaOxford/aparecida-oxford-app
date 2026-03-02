import { Router } from 'express'
import PptxGenJS from 'pptxgenjs'

interface SongPayload {
  id: number
  category: string
  title: string
  lyrics: string
  refrain?: string
  verse?: string
  subtitle?: string
}

const pptRouter = Router()

function normalizeSongText(song: SongPayload) {
  const segments = [song.subtitle, song.refrain, song.verse, song.lyrics].filter(Boolean)

  return segments.join('\n\n').trim()
}

function splitVerses(content: string) {
  return content
    .split(/\n\s*\n/g)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

pptRouter.post('/generate', async (request, response) => {
  const { songs, playlistName } = request.body as { songs?: SongPayload[]; playlistName?: string }

  if (!songs || songs.length === 0) {
    return response.status(400).json({ message: 'Selecione ao menos uma música para gerar o PowerPoint.' })
  }

  try {
    const pptx = new PptxGenJS()
    const safeName = (playlistName ?? 'repertorio-missa').replace(/[^a-zA-Z0-9-_\s]/g, '').trim() || 'repertorio-missa'
    pptx.layout = 'LAYOUT_WIDE'
    pptx.author = 'Aparecida Oxford App'
    pptx.subject = 'Repertório de missa'
    pptx.title = safeName

    songs.forEach((song) => {
      const text = normalizeSongText(song)
      const verses = splitVerses(text)

      verses.forEach((verse, index) => {
        const slide = pptx.addSlide()
        slide.background = { color: '000000' }

        slide.addText(`${song.category} • ${song.title}`, {
          x: 0.4,
          y: 0.15,
          w: 12.5,
          h: 0.5,
          fontFace: 'Arial',
          fontSize: 16,
          bold: true,
          color: 'F8FAFC',
          align: 'center',
        })

        slide.addText(verse, {
          x: 0.6,
          y: 0.85,
          w: 12.1,
          h: 5.8,
          fontFace: 'Arial',
          fontSize: 28,
          color: 'FFFFFF',
          align: 'center',
          valign: 'middle',
          margin: 0.05,
        })

        slide.addText(`${index + 1}/${verses.length}`, {
          x: 12.2,
          y: 6.7,
          w: 1,
          h: 0.25,
          fontFace: 'Arial',
          fontSize: 10,
          color: 'CBD5E1',
          align: 'right',
        })
      })
    })

    const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer
    const fileName = `${safeName.replace(/\s+/g, '_').toLowerCase()}.pptx`

    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)

    return response.send(buffer)
  } catch {
    return response.status(500).json({ message: 'Falha ao gerar PowerPoint.' })
  }
})

export { pptRouter }
