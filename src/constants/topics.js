export const TOPICS = [
  {
    id: 'birthday',
    name: 'Sinh nhật',
    description: 'Thiệp chúc mừng sinh nhật ấm áp, kèm hiệu ứng confetti.',
    icon: 'cake',
    available: true,
  },
  {
    id: 'galaxy_love',
    name: 'Ngân hà yêu thương',
    description: 'Ngân hà 3D hồng phát sáng — trái tim particle giữa vũ trụ tình yêu.',
    icon: 'auto_awesome',
    available: true,
  },
  {
    id: 'valentine',
    name: 'Valentine',
    description: 'Gửi lời yêu thương ngọt ngào trong ngày Valentine.',
    icon: 'favorite',
    available: false,
  },
  {
    id: 'graduation',
    name: 'Tốt nghiệp',
    description: 'Chúc mừng thành tích và chặng đường mới phía trước.',
    icon: 'school',
    available: false,
  },
  {
    id: 'anniversary',
    name: 'Kỷ niệm',
    description: 'Đánh dấu những cột mốc đáng nhớ bên nhau.',
    icon: 'local_florist',
    available: false,
  },
]

export function getTopicById(topicId) {
  return TOPICS.find((topic) => topic.id === topicId)
}
