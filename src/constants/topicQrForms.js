/**
 * Form tạo QR theo từng chủ đề anim.
 * Thêm topic mới → khai báo fields tương ứng tại đây.
 */

/**
 * Chuẩn hoá list cụm từ từ:
 * - mảng string
 * - chuỗi dạng [cụm 1][cụm 2]
 * - chuỗi xuống dòng (fallback)
 */
export function normalizePhraseList(value, max = 10) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, max)
  }

  const str = String(value ?? '')
  const bracketMatches = [...str.matchAll(/\[([^\]]*)\]/g)].map((match) => match[1].trim())
  if (bracketMatches.length > 0) {
    return bracketMatches.filter(Boolean).slice(0, max)
  }

  return str
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max)
}

/** Đếm số cặp [] trong chuỗi nhập */
export function countBracketPhrases(value) {
  const str = String(value ?? '')
  return [...str.matchAll(/\[[^\]]*\]/g)].length
}

export const TOPIC_QR_FORMS = {
  birthday: {
    title: 'Thiệp sinh nhật',
    hint: 'Hiển thị animation particle chữ chúc mừng sinh nhật.',
    defaults: {
      label: '',
      senderName: '',
      recipientName: '',
      phone: '',
      message:
        'Chúc bạn một ngày sinh nhật thật rực rỡ, ngập tràn yêu thương và những điều tốt đẹp nhất!',
    },
    fields: [
      {
        name: 'label',
        label: 'Tên gợi nhớ',
        required: true,
        placeholder: 'VD: Sinh nhật Mai — 15/08',
        help: 'Chỉ shop thấy — dùng để tìm QR trong danh sách.',
      },
      {
        name: 'recipientName',
        label: 'Tên người nhận',
        required: true,
        placeholder: 'VD: Lan Anh',
      },
      {
        name: 'senderName',
        label: 'Người gửi',
        required: false,
        placeholder: 'VD: Anh Minh',
      },
      {
        name: 'phone',
        label: 'SĐT (tuỳ chọn)',
        required: false,
        type: 'tel',
        placeholder: '0901 234 567',
        help: 'Không hiện trên thiệp — chỉ để tra cứu.',
      },
      {
        name: 'message',
        label: 'Lời chúc',
        required: true,
        type: 'textarea',
        placeholder: 'Nhập lời chúc sinh nhật...',
      },
    ],
  },
  galaxy_love: {
    title: 'Ngân hà yêu thương',
    hint: 'Galaxy 3D + trái tim particle. Keyword bay quanh ngân hà; lời nhắn hiện tuần tự sau khi tim nổ.',
    defaults: {
      label: '',
      keywords: '[]',
      messages: '[]',
      phone: '',
    },
    fields: [
      {
        name: 'label',
        label: 'Tên khách hàng',
        required: true,
        placeholder: 'VD: Chị Lan Anh',
        help: 'Chỉ shop thấy — dùng để tìm QR trong danh sách.',
      },
      {
        name: 'keywords',
        label: 'Keyword bay quanh ngân hà',
        required: true,
        type: 'phraseList',
        maxItems: 6,
        placeholder: '[I LOVE YOU][MY LOVE]',
        help: 'Mỗi cụm trong một cặp dấu [ ]. Enter hoặc bấm “Thêm cụm từ” để tạo cặp mới. Tối đa 6 cụm.',
      },
      {
        name: 'messages',
        label: 'Lời nhắn trong ngân hà',
        required: true,
        type: 'phraseList',
        maxItems: 10,
        placeholder: '[Cụm 1][Cụm 2]',
        help: 'Mỗi cụm trong một cặp dấu [ ]. Enter hoặc bấm “Thêm cụm từ” để tạo cặp mới. Tối đa 10 cụm — mỗi cụm giữ ~2 giây rồi chuyển tiếp. Cụm cuối giữ nguyên, không nổ.',
      },
      {
        name: 'phone',
        label: 'SĐT khách (tuỳ chọn)',
        required: false,
        type: 'tel',
        placeholder: '0901 234 567',
      },
    ],
  },
}

export function getTopicQrForm(topicId) {
  return TOPIC_QR_FORMS[topicId] || null
}

export function getEmptyFormValues(topicId) {
  const config = getTopicQrForm(topicId)
  if (!config) {
    return { label: '', senderName: '', recipientName: '', phone: '', message: '' }
  }
  return { ...config.defaults }
}
