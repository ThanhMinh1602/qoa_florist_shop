import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import ManageCardsFilters, { EMPTY_FILTERS } from '../components/ManageCardsFilters'
import ManageCardsTable, { CardQrModal } from '../components/ManageCardsTable'
import ManageCardsFiltersMobile from '../mobile/ManageCardsFiltersMobile'
import ManageCardsTableMobile from '../mobile/ManageCardsTableMobile'
import { useCards } from '../../../context/CardsContext'

function ManageCardsPage() {
  const { cards, isLoading, error, fetchCards, deleteCard } = useCards()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [selectedCard, setSelectedCard] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const isLgUp = useIsLgUp()

  const loadCards = useCallback(
    async (nextFilters) => {
      await fetchCards(nextFilters)
    },
    [fetchCards],
  )

  useEffect(() => {
    loadCards(EMPTY_FILTERS)
  }, [loadCards])

  function handleApplyFilters() {
    setAppliedFilters(filters)
    loadCards(filters)
  }

  function handleResetFilters() {
    setFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    loadCards(EMPTY_FILTERS)
  }

  async function handleDelete(card) {
    const confirmed = window.confirm(
      `Xóa thiệp gửi cho "${card.recipientName}"? Hành động này không thể hoàn tác.`,
    )

    if (!confirmed) return

    setDeletingId(card.id)
    const result = await deleteCard(card.id)
    setDeletingId(null)

    if (!result.success) {
      window.alert(result.message)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
        <h2 className="text-2xl font-semibold text-slate-900">Quản lý thiệp</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Tra cứu thiệp theo số điện thoại, tên người nhận, chủ đề hoặc khoảng thời gian tạo.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 lg:gap-6">
        {isLgUp ? (
          <ManageCardsFilters
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            isLoading={isLoading}
          />
        ) : (
          <ManageCardsFiltersMobile
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            isLoading={isLoading}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{cards.length}</span> thiệp
            {appliedFilters.search ||
            appliedFilters.phone ||
            appliedFilters.recipientName ||
            appliedFilters.topicId ||
            appliedFilters.from ||
            appliedFilters.to
              ? ' phù hợp bộ lọc'
              : ' trong hệ thống'}
          </p>
          <Link
            to="/admin/create"
            className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            + Tạo thiệp mới
          </Link>
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading && cards.length === 0 ? (
          <div className="rounded-2xl border border-rose-100 bg-white px-6 py-16 text-center">
            <p className="text-sm text-slate-500">Đang tải danh sách thiệp...</p>
          </div>
        ) : isLgUp ? (
          <ManageCardsTable
            cards={cards}
            onViewQr={setSelectedCard}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        ) : (
          <ManageCardsTableMobile
            cards={cards}
            onViewQr={setSelectedCard}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </div>

      {selectedCard ? (
        <CardQrModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      ) : null}
    </div>
  )
}

export default ManageCardsPage
