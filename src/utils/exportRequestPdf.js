import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportElementToPdf(element, filename) {
  if (!element) {
    throw new Error('Không tìm thấy nội dung để xuất PDF.')
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: (clonedDoc) => {
      const sheet = clonedDoc.querySelector('[data-pdf-sheet]')
      if (!sheet) return

      sheet.style.color = '#1e293b'
      sheet.style.backgroundColor = '#ffffff'

      sheet.querySelectorAll('*').forEach((node) => {
        if (!(node instanceof HTMLElement)) return
        const computed = clonedDoc.defaultView?.getComputedStyle(node)
        if (!computed) return

        if (computed.color?.includes('oklch')) node.style.color = '#1e293b'
        if (computed.backgroundColor?.includes('oklch')) node.style.backgroundColor = 'transparent'
        if (computed.borderColor?.includes('oklch')) node.style.borderColor = '#e2e8f0'
      })
    },
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgHeight = (canvas.height * pageWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}
