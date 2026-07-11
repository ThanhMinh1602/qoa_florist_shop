import MaterialIcon from './MaterialIcon'
import { getTopicById } from '../../constants/topics'

/** Hiển thị icon Material + tên chủ đề */
function TopicLabel({ topicId, topic, className = '', iconClassName = 'text-[1.1em]' }) {
  const resolved = topic ?? getTopicById(topicId)
  if (!resolved) {
    return <span className={className}>{topicId || '—'}</span>
  }

  return (
    <span className={['inline-flex items-center gap-1', className].filter(Boolean).join(' ')}>
      <MaterialIcon name={resolved.icon || 'style'} className={iconClassName} />
      <span>{resolved.name}</span>
    </span>
  )
}

export default TopicLabel
