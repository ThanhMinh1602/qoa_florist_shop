export const TOPICS = [
  {
    id: 'birthday',
    name: 'Sinh nhật',
    description: 'Thiệp chúc mừng sinh nhật ấm áp, kèm hiệu ứng confetti.',
    emoji: '🎂',
    available: true,
  },
  {
    id: 'valentine',
    name: 'Valentine',
    description: 'Gửi lời yêu thương ngọt ngào trong ngày Valentine.',
    emoji: '💝',
    available: false,
  },
  {
    id: 'graduation',
    name: 'Tốt nghiệp',
    description: 'Chúc mừng thành tích và chặng đường mới phía trước.',
    emoji: '🎓',
    available: false,
  },
  {
    id: 'anniversary',
    name: 'Kỷ niệm',
    description: 'Đánh dấu những cột mốc đáng nhớ bên nhau.',
    emoji: '💐',
    available: false,
  },
]

export function getTopicById(topicId) {
  return TOPICS.find((topic) => topic.id === topicId)
}
