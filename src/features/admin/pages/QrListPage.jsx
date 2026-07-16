import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import TopicLabel from '../../../components/common/TopicLabel'
import { useCards } from '../../../context/CardsContext'
import { useDialog } from '../../../context/DialogContext'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'
import { buildGreetingUrl } from '../../../constants/app'
import CardQrPanel from '../components/CardQrPanel'

function QrListPage() {
  const { cards, isLoading, error, fetchCards, deleteCard } = useCards()
  const { confirm, alert } = useDialog()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const isLgUp = useIsLgUp()

  const load = useCallback(async () => {
    await fetchCards(search.trim() ? { search: search.trim() } : {})
  }, [fetchCards, search])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete(card) {
    const ok = await confirm({
      title: 'Xóa QR',
      message: `Xóa “${card.label || card.recipientName}”? Link QR sẽ không còn dùng được.`,
      confirmLabel: 'Xóa',
      variant: 'danger',
    })
    if (!ok) return
    const result = await deleteCard(card.id)
    if (!result.success) {
      await alert({ title: 'Không thể xóa', message: result.message, variant: 'error' })
      return
    }
    if (selected?.id === card.id) setSelected(null)
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Danh sách QR</h2>
            <p className="mt-1 text-sm text-slate-500">
              Các thiệp QR đã tạo — tìm theo tên khách / gợi nhớ, keyword hoặc lời nhắn.
            </p>
          </div>
          <Link
            to="/admin/qr/new"
            className="inline-flex items-center gap-1 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            <MaterialIcon name="add" className="text-lg" />
            Tạo QR mới
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên khách, keyword, lời nhắn..."
            className="w-full max-w-md rounded-xl border border-rose-100 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        {isLoading ? (
          <p className="py-12 text-center text-sm text-slate-500">Đang tải...</p>
        ) : cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
            <MaterialIcon name="qr_code_2" className="text-4xl text-rose-200" />
            <p className="mt-3 text-sm font-medium text-slate-700">Chưa có QR nào</p>
            <Link to="/admin/qr/new" className="mt-3 inline-block text-sm font-medium text-rose-600">
              Tạo QR đầu tiên
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
              {isLgUp ? (
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-rose-100 bg-rose-50/60 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Tên khách / gợi nhớ</th>
                      <th className="px-4 py-3">Chủ đề</th>
                      <th className="px-4 py-3">Nội dung</th>
                      <th className="px-4 py-3">Tạo</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {cards.map((card) => (
                      <tr
                        key={card.id}
                        className={selected?.id === card.id ? 'bg-rose-50/40' : ''}
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelected(card)}
                            className="text-left font-semibold text-slate-900 hover:text-rose-700"
                          >
                            {card.label || '(Chưa đặt tên)'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <TopicLabel topicId={card.topicId} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {card.topicId === 'galaxy_love'
                            ? (card.keywords || []).filter(Boolean).slice(0, 3).join(' · ') ||
                              (card.messages || [])[0] ||
                              '—'
                            : card.recipientName}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                          {formatTimeAgo(card.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelected(card)}
                            className="mr-2 text-sm font-medium text-rose-600"
                          >
                            QR
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(card)}
                            className="text-sm text-red-500"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <ul className="divide-y divide-rose-50">
                  {cards.map((card) => (
                    <li key={card.id} className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelected(card)}
                        className="w-full text-left"
                      >
                        <p className="font-semibold text-slate-900">
                          {card.label || '(Chưa đặt tên)'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          <TopicLabel topicId={card.topicId} /> ·{' '}
                          {card.topicId === 'galaxy_love'
                            ? (card.keywords || []).filter(Boolean).slice(0, 2).join(' · ') ||
                              card.label
                            : card.recipientName}{' '}
                          · {formatTimeAgo(card.createdAt)}
                        </p>
                      </button>
                      <div className="mt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSelected(card)}
                          className="text-sm font-medium text-rose-600"
                        >
                          Xem QR
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(card)}
                          className="text-sm text-red-500"
                        >
                          Xóa
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
              {selected ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Chi tiết
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {selected.label || selected.recipientName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{buildGreetingUrl(selected.id)}</p>
                  <div className="mt-4">
                    <CardQrPanel card={selected} embedded />
                  </div>
                </>
              ) : (
                <p className="py-10 text-center text-sm text-slate-400">
                  Chọn một QR để xem mã và link.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

export default QrListPage
