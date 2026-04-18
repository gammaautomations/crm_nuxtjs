import type { IInvoice } from '~/server/models/Invoice'

// ─── Helpers de formato ───────────────────────────────────────────────────────

const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n ?? 0)

const date = (d: Date | string | undefined) =>
  d ? new Intl.DateTimeFormat('es-ES').format(new Date(d)) : '—'

// ─── Template HTML ────────────────────────────────────────────────────────────

const buildInvoiceHtml = (invoice: IInvoice): string => {
  const typeLabel: Record<string, string> = {
    invoice:     'FACTURA',
    credit_note: 'FACTURA RECTIFICATIVA',
    proforma:    'FACTURA PROFORMA',
    receipt:     'RECIBO',
  }

  const igicRows = invoice.igicBreakdown.map(b => `
    <tr>
      <td>IGIC ${b.rate}%</td>
      <td>${eur(b.base)}</td>
      <td>${eur(b.amount)}</td>
    </tr>
  `).join('')

  const lineRows = invoice.lines.map((line, i) => `
    <tr class="${i % 2 === 0 ? 'even' : ''}">
      <td>${line.description}</td>
      <td class="right">${line.quantity}</td>
      <td class="right">${eur(line.unitPrice)}</td>
      <td class="right">${line.discount > 0 ? `${line.discount}%` : '—'}</td>
      <td class="right">${line.igicRate}%</td>
      <td class="right">${eur(line.subtotal)}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      color: #2d2d2d;
      padding: 40px;
      background: #fff;
    }

    /* ── Cabecera ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 3px solid #7367F0;
    }
    .logo-area h1 {
      font-size: 26px;
      font-weight: 800;
      color: #7367F0;
      letter-spacing: -0.5px;
    }
    .logo-area p { color: #888; font-size: 11px; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-type {
      font-size: 20px;
      font-weight: 700;
      color: #7367F0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .invoice-number {
      font-size: 15px;
      font-weight: 600;
      color: #444;
      margin-top: 4px;
    }
    .invoice-dates { margin-top: 8px; color: #666; font-size: 11px; line-height: 1.8; }

    /* ── Partes ── */
    .parties {
      display: flex;
      gap: 24px;
      margin-bottom: 28px;
    }
    .party {
      flex: 1;
      background: #f9f9ff;
      border: 1px solid #ebe9ff;
      border-radius: 8px;
      padding: 16px 20px;
    }
    .party-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #7367F0;
      margin-bottom: 8px;
    }
    .party-name { font-size: 14px; font-weight: 700; color: #222; }
    .party-detail { color: #666; font-size: 11px; line-height: 1.8; margin-top: 4px; }

    /* ── Tabla de líneas ── */
    .lines-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .lines-table thead tr {
      background: #7367F0;
      color: #fff;
    }
    .lines-table thead th {
      padding: 9px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .lines-table thead th.right { text-align: right; }
    .lines-table tbody tr { border-bottom: 1px solid #f0f0f0; }
    .lines-table tbody tr.even { background: #fafafa; }
    .lines-table tbody td {
      padding: 9px 12px;
      font-size: 11px;
      vertical-align: top;
    }
    .lines-table tbody td.right { text-align: right; }

    /* ── Totales ── */
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }
    .totals-table {
      width: 300px;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 7px 12px;
      font-size: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    .totals-table td:last-child { text-align: right; font-weight: 600; }
    .totals-table .igic-header td {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #7367F0;
      background: #f0efff;
      border-bottom: none;
      padding-top: 10px;
    }
    .totals-table .total-row td {
      font-size: 14px;
      font-weight: 800;
      color: #7367F0;
      background: #f0efff;
      border-top: 2px solid #7367F0;
      border-bottom: none;
      padding: 10px 12px;
    }

    /* ── IGIC breakdown ── */
    .igic-breakdown {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
    }
    .igic-breakdown thead th {
      background: #f0efff;
      color: #7367F0;
      padding: 6px 10px;
      text-align: left;
      font-weight: 600;
    }
    .igic-breakdown thead th:not(:first-child) { text-align: right; }
    .igic-breakdown tbody td { padding: 6px 10px; border-bottom: 1px solid #f5f5f5; }
    .igic-breakdown tbody td:not(:first-child) { text-align: right; }

    /* ── Notas ── */
    .notes {
      background: #fffbf0;
      border-left: 4px solid #FFB400;
      border-radius: 4px;
      padding: 12px 16px;
      font-size: 11px;
      color: #555;
      margin-bottom: 20px;
    }
    .notes-label {
      font-weight: 700;
      color: #FFB400;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    /* ── Footer ── */
    .footer {
      border-top: 1px solid #eee;
      padding-top: 14px;
      text-align: center;
      color: #aaa;
      font-size: 10px;
    }

    /* ── Badge de estado ── */
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .status-draft     { background: #f0f0f0; color: #888; }
    .status-sent      { background: #e8f4ff; color: #2196F3; }
    .status-paid      { background: #e8fff0; color: #28C76F; }
    .status-partial   { background: #fff8e0; color: #FFB400; }
    .status-overdue   { background: #ffe8e8; color: #FF4C51; }
    .status-cancelled { background: #f0f0f0; color: #888; }
  </style>
</head>
<body>

  <!-- CABECERA -->
  <div class="header">
    <div class="logo-area">
      <h1>${invoice.issuer.name}</h1>
      <p>NIF/CIF: ${invoice.issuer.nif}</p>
      ${invoice.issuer.address?.street ? `<p>${invoice.issuer.address.street}</p>` : ''}
      ${invoice.issuer.address?.city   ? `<p>${invoice.issuer.address.zip} ${invoice.issuer.address.city} — ${invoice.issuer.address.island}</p>` : ''}
      ${invoice.issuer.email  ? `<p>${invoice.issuer.email}</p>` : ''}
      ${invoice.issuer.phone  ? `<p>${invoice.issuer.phone}</p>`  : ''}
    </div>
    <div class="invoice-meta">
      <div class="invoice-type">
        ${typeLabel[invoice.type] ?? 'FACTURA'}
        <span class="status-badge status-${invoice.status}">${invoice.status}</span>
      </div>
      <div class="invoice-number">${invoice.number}</div>
      <div class="invoice-dates">
        <div>Fecha de emisión: <strong>${date(invoice.issuedAt)}</strong></div>
        ${invoice.dueDate ? `<div>Fecha de vencimiento: <strong>${date(invoice.dueDate)}</strong></div>` : ''}
      </div>
    </div>
  </div>

  <!-- PARTES -->
  <div class="parties">
    <div class="party">
      <div class="party-label">Emisor</div>
      <div class="party-name">${invoice.issuer.name}</div>
      <div class="party-detail">
        NIF/CIF: ${invoice.issuer.nif}<br>
        ${invoice.issuer.address?.street ?? ''}<br>
        ${invoice.issuer.address?.zip ?? ''} ${invoice.issuer.address?.city ?? ''}<br>
        ${invoice.issuer.address?.island ?? ''} — ${invoice.issuer.address?.province ?? ''}
      </div>
    </div>
    <div class="party">
      <div class="party-label">Cliente</div>
      <div class="party-name">${invoice.client.name}</div>
      <div class="party-detail">
        NIF/CIF: ${invoice.client.nif}<br>
        ${invoice.client.address?.street ?? ''}<br>
        ${invoice.client.address?.zip ?? ''} ${invoice.client.address?.city ?? ''}<br>
        ${invoice.client.address?.island ?? ''} — ${invoice.client.address?.province ?? ''}
        ${invoice.client.email ? `<br>${invoice.client.email}` : ''}
      </div>
    </div>
  </div>

  <!-- LÍNEAS -->
  <table class="lines-table">
    <thead>
      <tr>
        <th>Descripción</th>
        <th class="right">Cant.</th>
        <th class="right">Precio unit.</th>
        <th class="right">Dto.</th>
        <th class="right">IGIC</th>
        <th class="right">Base imp.</th>
      </tr>
    </thead>
    <tbody>
      ${lineRows}
    </tbody>
  </table>

  <!-- DESGLOSE IGIC -->
  <table class="igic-breakdown">
    <thead>
      <tr>
        <th>Tipo IGIC</th>
        <th>Base imponible</th>
        <th>Cuota IGIC</th>
      </tr>
    </thead>
    <tbody>
      ${igicRows}
    </tbody>
  </table>

  <!-- TOTALES -->
  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td>Base imponible</td>
        <td>${eur(invoice.subtotal)}</td>
      </tr>
      <tr>
        <td>Total IGIC</td>
        <td>${eur(invoice.totalIgic)}</td>
      </tr>
      <tr class="total-row">
        <td>TOTAL</td>
        <td>${eur(invoice.total)}</td>
      </tr>
      ${invoice.amountPaid > 0 ? `
      <tr>
        <td style="color:#28C76F">Importe pagado</td>
        <td style="color:#28C76F">— ${eur(invoice.amountPaid)}</td>
      </tr>
      <tr>
        <td style="color:#FF4C51; font-weight:700">Saldo pendiente</td>
        <td style="color:#FF4C51; font-weight:700">${eur(invoice.amountDue)}</td>
      </tr>` : ''}
    </table>
  </div>

  <!-- NOTAS -->
  ${invoice.notes ? `
  <div class="notes">
    <div class="notes-label">Notas</div>
    ${invoice.notes}
  </div>` : ''}

  <!-- FOOTER -->
  <div class="footer">
    <p>${invoice.issuer.name} · NIF/CIF ${invoice.issuer.nif}</p>
    <p>Factura emitida en las Islas Canarias — Sujeta a IGIC (Impuesto General Indirecto Canario)</p>
  </div>

</body>
</html>
`
}

// ─── Generador de PDF ─────────────────────────────────────────────────────────

export const generateInvoicePdf = async (invoice: IInvoice): Promise<Buffer> => {
  // Importación dinámica para no cargar Puppeteer en el arranque
  // Instala: npm install puppeteer-core @sparticuz/chromium
  const [{ default: puppeteer }, { default: chromium }] = await Promise.all([
    import('puppeteer-core'),
    import('@sparticuz/chromium'),
  ])

  const browser = await puppeteer.launch({
    args:            chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath:  await chromium.executablePath(),
    headless:        true,
  })

  try {
    const page = await browser.newPage()
    const html = buildInvoiceHtml(invoice)

    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format:          'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '0mm', right: '0mm' },
    })

    return Buffer.from(pdf)
  }
  finally {
    await browser.close()
  }
}
