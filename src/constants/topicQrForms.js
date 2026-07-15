/**
 * Form tạo QR theo từng chủ đề anim.
 * Thêm topic mới → khai báo fields tương ứng tại đây.
 */
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
    hint: 'Galaxy 3D + trái tim particle. Chữ bay quanh ngân hà lấy từ các trường bên dưới.',
    defaults: {
      label: '',
      senderName: '',
      recipientName: '',
      phone: '',
      message: 'Một góc ngân hà này dành riêng cho em.',
    },
    fields: [
      {
        name: 'label',
        label: 'Tên gợi nhớ',
        required: true,
        placeholder: 'VD: Galaxy cho Lan — Valentine',
        help: 'Chỉ shop thấy — đặt tên dễ nhớ để tìm lại QR.',
      },
      {
        name: 'recipientName',
        label: 'Tên người yêu / người nhận',
        required: true,
        placeholder: 'VD: Em yêu',
        help: 'Hiện trên chữ bay quanh ngân hà.',
      },
      {
        name: 'senderName',
        label: 'Ký tên người gửi',
        required: false,
        placeholder: 'VD: Anh',
        help: 'Có thể hiện dạng ♥ tên người gửi.',
      },
      {
        name: 'message',
        label: 'Lời nhắn trong ngân hà',
        required: true,
        type: 'textarea',
        placeholder: 'Lời nhắn hiện khi chạm chữ bay...',
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
  return config ? { ...config.defaults } : { label: '', senderName: '', recipientName: '', phone: '', message: '' }
}
