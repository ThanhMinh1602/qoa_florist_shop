import MaterialIcon from '../../../../components/common/MaterialIcon'

function ImageListEditor({
  images,
  emptyLabel,
  dragId,
  onPickFiles,
  onRemove,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  return (
    <div className="space-y-3">
      <label className="btn-glass inline-flex cursor-pointer">
        <MaterialIcon name="upload" className="text-lg" />
        Thêm ảnh
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPickFiles}
        />
      </label>

      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant/40 px-4 py-8 text-center">
          <MaterialIcon name="image" className="text-3xl text-outline" />
          <p className="mt-2 text-sm text-on-surface-variant">{emptyLabel}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              draggable
              onDragStart={(event) => onDragStart(event, image.id)}
              onDragOver={onDragOver}
              onDrop={(event) => onDrop(event, image.id)}
              onDragEnd={onDragEnd}
              className={[
                'flex items-center gap-3 rounded-xl border bg-surface-container-lowest p-2 transition',
                dragId === image.id ? 'border-primary/50 opacity-60' : 'border-outline-variant/25',
              ].join(' ')}
            >
              <span
                className="flex cursor-grab items-center gap-1 text-outline active:cursor-grabbing"
                title="Kéo để sắp xếp"
                aria-hidden="true"
              >
                <MaterialIcon name="drag_indicator" className="text-xl" />
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-container-low text-xs font-bold text-primary">
                  {index + 1}
                </span>
              </span>
              <img
                src={image.url}
                alt=""
                className="pointer-events-none h-16 w-24 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">
                  Vị trí {index + 1}
                  {index === 0 ? ' · Ảnh đại diện' : ''}
                </p>
                <p className="truncate text-xs text-outline">
                  {image.file ? 'Chưa lưu — chỉ preview' : image.publicId || 'Đã lưu'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMove(image.id, -1)}
                  disabled={index === 0}
                  className="rounded-lg border border-outline-variant/30 p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30"
                  aria-label="Đưa lên"
                >
                  <MaterialIcon name="keyboard_arrow_up" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(image.id, 1)}
                  disabled={index === images.length - 1}
                  className="rounded-lg border border-outline-variant/30 p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30"
                  aria-label="Đưa xuống"
                >
                  <MaterialIcon name="keyboard_arrow_down" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(image)}
                  className="rounded-lg p-2 text-error hover:bg-error-container/40"
                  aria-label="Xóa"
                >
                  <MaterialIcon name="delete" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ImageListEditor
