import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDialog } from '../../../context/DialogContext'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import ManageCardsFilters, { EMPTY_FILTERS } from '../components/ManageCardsFilters'
import ManageCardsTable, { CardQrModal } from '../components/ManageCardsTable'
import ManageCardsFiltersMobile from '../mobile/ManageCardsFiltersMobile'
import ManageCardsTableMobile from '../mobile/ManageCardsTableMobile'
import { useCards } from '../../../context/CardsContext'

function ManageCardsPanel() {
  const { alert, confirm } = useDialog()
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
    const confirmed = await confirm({
      title: 'Xóa thiệp',
      message: `Xóa thiệp gửi cho “${card.recipientName}”? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa thiệp',
      variant: 'danger',
    })

    if (!confirmed) return

    setDeletingId(card.id)
    const result = await deleteCard(card.id)
    setDeletingId(null)

    if (!result.success) {
      await alert({
        title: 'Không thể xóa',
        message: result.message || 'Không thể xóa thiệp.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
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
          <span className="font-semibold text-slate-800">{cards.length}</span> thiệp QR
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
          to="/admin/orders/new"
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

      {selectedCard ? (
        <CardQrModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      ) : null}
    </div>
  )
}

export default ManageCardsPanel
