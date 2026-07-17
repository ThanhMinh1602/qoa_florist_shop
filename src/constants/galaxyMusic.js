/**
 * Danh sách nhạc nền cho thiệp Galaxy.
 * Tự nhận diện MỌI file .mp3 trong src/assets/audios/ — chỉ cần bỏ file mới vào đó.
 */

const audioModules = import.meta.glob('../assets/audios/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
})

function prettifyName(fileName) {
  return fileName
    .replace(/\.mp3$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/** [{ id, name, url }] — id = tên file không đuôi (lưu vào thẻ) */
export const MUSIC_TRACKS = Object.entries(audioModules)
  .map(([path, url]) => {
    const fileName = path.split('/').pop() || ''
    const id = fileName.replace(/\.mp3$/i, '')
    return { id, name: prettifyName(fileName), url }
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'vi'))

const trackById = new Map(MUSIC_TRACKS.map((track) => [track.id, track]))

export function getMusicTrack(id) {
  if (!id) return null
  return trackById.get(id) || null
}

export function getMusicUrl(id) {
  return getMusicTrack(id)?.url ?? ''
}

export function getMusicName(id) {
  return getMusicTrack(id)?.name ?? ''
}
