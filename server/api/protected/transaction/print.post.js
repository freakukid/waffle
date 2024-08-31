import { getServerSession } from '#auth'
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer'
import { Decimal } from 'decimal.js'
import { join } from 'path'
import { cwd } from 'process'

//https://github.com/Klemen1337/node-thermal-printer

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  const user_id = session?.user?.boss?.id
  //Check if user is login
  if(!user_id) {
    return { statusCode: 400, statusMessage: 'You must be login print a receipt.' }
  }

  //Data
  let { store_id, items, tax, subtotal, tax_total, savings, total } = await readBody(event)

  //Check data
  if(!store_id) {
    return { statusCode: 400, statusMessage: 'Need store id.' }
  }

  if(!items || !items.length) {
    return { statusCode: 400, statusMessage: 'Receipt needs items.' }
  }

  if(!subtotal || !tax_total || !total) {
    return { statusCode: 400, statusMessage: 'Missing subtotal, tax total, or total' }
  }

  //Get store
  const store = await prisma.store.findUnique({
    where: {
      id: store_id
    }
  })

  //Get settings
  const settings = await prisma.settings.findUnique({
    where: {
      user_id: user_id
    }
  })

  //Check if ip address is present
  if(!settings.ip) {
    return { statusCode: 400, statusMessage: 'You must setup an ip address to connect to.' }
  }

  //Connect to printer
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `tcp://${settings.ip}`
  })

  //Check if printer is connected
  let isConnected = await printer.isPrinterConnected()
  if(!isConnected) {
    return { statusCode: 400, statusMessage: 'Printer is not connected.' }
  }

  //Setup Logo
  const image = join(cwd(), 'public', 'test.png')
  printer.alignCenter()
  try {
    await printer.printImage(image)
  } catch (e) {
    console.log(e)
  }

  printer.newLine()

  //Setup Header
  const header = store.header
  for (let i = 0; i < header.length; i++) {
    setupCustomText(printer, store.header[i])
  }

  printer.newLine()
  printer.setTypeFontA()
  printer.setTextNormal()
  printer.alignLeft()

  //Setup Products Bought
  for (let i = 0; i < items.length; i++) {
    let product = items[i]
    printer.tableCustom([
      { text: product.name, align:"LEFT", width:0.6 },
      { text: calcItemTotal(product.qty, product.price, product.discount), align:"RIGHT", width:0.25 },
    ])

    if(product.discount > 0)
      printer.println(`  (${product.qty} @ ${product.price} ea) | Discount ${product.discount}%`)
    else if(product.qty > 1)
      printer.println(`  (${product.qty} @ ${product.price} ea)`)
  }

  printer.newLine()

  //Setup totals
  if(savings && savings !== '0.00') {
    printer.tableCustom([
      { text: `SAVINGS:`, align:"RIGHT", width:0.6 },
      { text: savings, align:"RIGHT", width:0.25 },
    ])
  }
  printer.tableCustom([
    { text: `SUBTOTAL:`, align:"RIGHT", width:0.6 },
    { text: subtotal, align:"RIGHT", width:0.25 },
  ])
  printer.tableCustom([
    { text: `TAX(${tax}%):`, align:"RIGHT", width:0.6 },
    { text: tax_total, align:"RIGHT", width:0.25 },
  ])
  printer.tableCustom([
    { text: `TOTAL:`, align:"RIGHT", width:0.6, bold: true },
    { text: total, align:"RIGHT", width:0.25, bold: true },
  ])

  //Setup Footer
  printer.newLine()
  const footer = store.footer
  for (let i = 0; i < footer.length; i++) {
    setupCustomText(printer, store.footer[i])
  }

  //Cut Receipt
  printer.cut()
  
  //Execute previous printer commands
  try {
    let execute = printer.execute()
  } catch (error) {
    console.error("Print failed:", error)
  }
  
  setResponseStatus(event, 201)
  
  return {
    message: "Print receipt!"
  }
})

//Sets up custom header, footer
function setupCustomText(printer, item) {
  if(item.align === 'left')
    printer.alignLeft()
  else if(item.align === 'center')
    printer.alignCenter()
  else if(item.align === 'right')
    printer.alignRight()

  if(item.size === 1) {
    printer.setTypeFontB()
  } else if(item.size === 2) {
    printer.setTypeFontA()
    printer.setTextNormal()
  } else if(item.size === 3) {
    printer.setTypeFontB()
    printer.setTextSize(1, 1)
  }

  printer.println(item.text)
}

//Calculates item subtotal
function calcItemTotal(q, p, d) {
  const qty = new Decimal(q)
  const price = new Decimal(p)
  const discount = new Decimal(d).div(100)
  let itemSubtotal = qty.times(price)

  if(discount > 0) {
    itemSubtotal = itemSubtotal.minus(itemSubtotal.times(discount))
  }

  return itemSubtotal.toFixed(2)
}