/**
 * Form tạo QR theo từng chủ đề anim.
 * Thêm topic mới → khai báo fields tương ứng tại đây.
 */

/** Chuẩn hoá list cụm từ từ mảng hoặc chuỗi xuống dòng */
export function normalizePhraseList(value, max = 10) {
  let items = []
  if (Array.isArray(value)) {
    items = value.map((item) => String(item ?? '').trim())
  } else if (typeof value === 'string') {
    items = value.split(/\n+/).map((item) => item.trim())
  }
  return items.filter(Boolean).slice(0, max)
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
      keywords: [''],
      messages: [''],
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
        placeholder: 'VD: I LOVE YOU',
        help: 'Tối đa 6 cụm từ — hiện dạng chữ bay quanh galaxy.',
      },
      {
        name: 'messages',
        label: 'Lời nhắn trong ngân hà',
        required: true,
        type: 'phraseList',
        maxItems: 10,
        placeholder: 'VD: Một góc ngân hà này dành riêng cho em',
        help: 'Tối đa 10 cụm từ — mỗi cụm giữ tối thiểu ~2 giây (lâu hơn nếu dài) rồi nổ ra gom thành cụm tiếp. Cụm cuối hiện và giữ nguyên, không nổ.',
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
  return {
    ...config.defaults,
    keywords: config.defaults.keywords ? [...config.defaults.keywords] : undefined,
    messages: config.defaults.messages ? [...config.defaults.messages] : undefined,
  }
}
