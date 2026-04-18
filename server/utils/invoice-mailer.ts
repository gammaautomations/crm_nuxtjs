import { createTransporter } from '~/server/utils/mailer'

export const sendInvoiceEmail = async (
  email: string,
  clientName: string,
  invoiceNumber: string,
  total: number,
  dueDate: Date | undefined,
  pdfBuffer: Buffer,
) => {
  const config      = useRuntimeConfig()
  const transporter = createTransporter()

  const fTotal   = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(total)
  const fDueDate = dueDate ? new Intl.DateTimeFormat('es-ES').format(new Date(dueDate)) : null

  await transporter.sendMail({
    from:    `"${config.public.appName || 'CRM'}" <${config.mailFrom}>`,
    to:      email,
    subject: `Factura ${invoiceNumber} — ${fTotal}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .container{max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden}
  .header{background:#7367F0;padding:24px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:22px}
  .body{padding:32px}
  .footer{background:#f4f4f4;padding:16px;text-align:center;color:#999;font-size:12px}
  .table{width:100%;border-collapse:collapse;margin:20px 0}
  .table td{padding:10px 14px;border-bottom:1px solid #f0f0f0}
  .table td:last-child{text-align:right;font-weight:bold}
  .badge{display:inline-block;background:#f0efff;color:#7367F0;padding:4px 12px;border-radius:20px;font-size:14px}
</style></head><body>
<div class="container">
  <div class="header"><h1>📄 Factura ${invoiceNumber}</h1></div>
  <div class="body">
    <h2>Hola ${clientName},</h2>
    <p>Adjuntamos la factura <strong>${invoiceNumber}</strong> por los servicios prestados.</p>
    <table class="table">
      <tr><td>Número de factura</td><td><span class="badge">${invoiceNumber}</span></td></tr>
      <tr><td>Importe total (IGIC incluido)</td><td>${fTotal}</td></tr>
      ${fDueDate ? `<tr><td>Fecha de vencimiento</td><td>${fDueDate}</td></tr>` : ''}
    </table>
    <p>El PDF de la factura se encuentra adjunto a este email.</p>
    <p>Si tiene cualquier duda no dude en contactarnos.</p>
  </div>
  <div class="footer">Este email fue enviado automáticamente. Por favor no respondas a este mensaje.</div>
</div>
</body></html>`,
    attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
  })
}

export const sendInvoiceOverdueEmail = async (
  email: string,
  lawyerName: string,
  clientName: string,
  invoiceNumber: string,
  amountDue: number,
  dueDate: Date,
) => {
  const config      = useRuntimeConfig()
  const transporter = createTransporter()

  const fDue     = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amountDue)
  const fDueDate = new Intl.DateTimeFormat('es-ES').format(new Date(dueDate))

  await transporter.sendMail({
    from:    `"${config.public.appName || 'CRM'}" <${config.mailFrom}>`,
    to:      email,
    subject: `⚠️ Factura vencida: ${invoiceNumber}`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .container{max-width:600px;margin:30px auto;background:#fff;border-radius:8px;overflow:hidden}
  .header{background:#FF4C51;padding:24px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:22px}
  .body{padding:32px}
  .footer{background:#f4f4f4;padding:16px;text-align:center;color:#999;font-size:12px}
  .btn{display:inline-block;background:#7367F0;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px}
  .alert{background:#fff5f5;border-left:4px solid #FF4C51;padding:16px;border-radius:4px;margin:16px 0}
</style></head><body>
<div class="container">
  <div class="header"><h1>⚠️ Factura vencida</h1></div>
  <div class="body">
    <h2>Hola ${lawyerName},</h2>
    <div class="alert">
      <p style="margin:0">La factura <strong>${invoiceNumber}</strong> del cliente <strong>${clientName}</strong>
      venció el <strong>${fDueDate}</strong> con un saldo pendiente de <strong>${fDue}</strong>.</p>
    </div>
    <p>Por favor, contacta con el cliente para gestionar el cobro.</p>
    <a href="${config.public.appUrl}/billing" class="btn">Ver factura</a>
  </div>
  <div class="footer">Este email fue enviado automáticamente. Por favor no respondas a este mensaje.</div>
</div>
</body></html>`,
  })
}
