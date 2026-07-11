import ManageCardsPanel from '../components/ManageCardsPanel'

/** @deprecated Use AdminManagePage tab=cards — kept as thin wrapper if imported elsewhere */
function ManageCardsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
        <h2 className="text-2xl font-semibold text-slate-900">Quản lý thiệp QR</h2>
      </header>
      <div className="p-4 md:p-8">
        <ManageCardsPanel />
      </div>
    </div>
  )
}

export default ManageCardsPage
