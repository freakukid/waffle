import { Decimal } from 'decimal.js'

export default () => {
  function calcSubtotal(items) {
    let noDiscountSubtotal = new Decimal(0)
    let discountSubtotal = new Decimal(0)
    let totalPrice = new Decimal(0)
    let totalCost = new Decimal(0)

    for (const item of items) {
      const qty = new Decimal(item.qty)
      const price = new Decimal(item.price)
      const discount = new Decimal(item.discount).div(100)
      const cost = new Decimal(item.cost)

      const itemSubtotal = qty.times(price)
      noDiscountSubtotal = noDiscountSubtotal.plus(itemSubtotal)
      
      totalCost = totalCost.plus(qty.times(cost))

      if(discount > 0) {
        const discountSubtotalPrice = itemSubtotal.minus(itemSubtotal.times(discount))
        discountSubtotal = discountSubtotal.plus(discountSubtotalPrice)
        item['new_price'] = price.minus(price.times(discount)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        totalPrice = totalPrice.plus(discountSubtotalPrice)
      } else {
        discountSubtotal = discountSubtotal.plus(itemSubtotal)
        totalPrice = totalPrice.plus(itemSubtotal)
      }
    }

    return {subtotal: discountSubtotal, noDiscountSubtotal: noDiscountSubtotal, savings: noDiscountSubtotal.minus(discountSubtotal), profit: totalPrice.minus(totalCost)}
  }

  function calcDictSubtotal(items, qtyKey, priceKey, discountKey) {
    let noDiscountSubtotal = new Decimal(0)
    let discountSubtotal = new Decimal(0)
    
    //Add subtotal
    Object.values(items).forEach((item) => {
      const qty = new Decimal(item[qtyKey])
      const price = new Decimal(item[priceKey])
      let discount = 0
      if(discountKey) {
        discount = new Decimal(item[discountKey]).div(100)
      }

      const itemSubtotal = qty.times(price)
      noDiscountSubtotal = noDiscountSubtotal.plus(itemSubtotal)

      if(discount > 0) {
        discountSubtotal = discountSubtotal.plus(itemSubtotal.minus(itemSubtotal.times(discount)))
        item['__new_price'] = price.minus(price.times(discount)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      } else {
        discountSubtotal = discountSubtotal.plus(itemSubtotal)
      }
    })

    return {subtotal: discountSubtotal, noDiscountSubtotal: noDiscountSubtotal, savings: noDiscountSubtotal.minus(discountSubtotal)}
  }

  function calcTaxTotal(subtotal, tax) {
    return subtotal.times(new Decimal(tax).div(100))
  }

  function calcTotal(subtotal, taxTotal) {
    return subtotal.plus(taxTotal)
  }

  function calcTotalCost(qty, costPerItem) {
    return new Decimal(qty).times(new Decimal(costPerItem))
  }

  function calcChange(cash, total) {
    return new Decimal(cash).minus(new Decimal(total))
  }

  return {
    calcSubtotal,
    calcDictSubtotal,
    calcTaxTotal,
    calcTotal,
    calcTotalCost,
    calcChange
  }
}