import BirthdayScreen from './BirthdayScreen'
import GalaxyOfLoveScreen from './GalaxyOfLoveScreen'

/** Chọn màn thiệp theo chủ đề (giống sinh nhật / ngân hà yêu thương). */
function TopicGreetingScreen({ topicId = 'birthday', ...props }) {
  if (topicId === 'galaxy_love') {
    return <GalaxyOfLoveScreen {...props} />
  }

  return <BirthdayScreen {...props} />
}

export default TopicGreetingScreen
