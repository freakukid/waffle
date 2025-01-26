import { Decimal } from 'decimal.js'
import moment from 'moment'

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
        const newPrice = price.minus(price.times(discount))
        discountSubtotal = discountSubtotal.plus(discountSubtotalPrice)
        item['new_price'] = newPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        item['subtotal'] = newPrice.times(qty).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        totalPrice = totalPrice.plus(discountSubtotalPrice)
      } else {
        item['subtotal'] = itemSubtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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

  function calcAvgCostPerItem(prevQty, prevCost, newQty, additionalCost) {
    const prevTotalCost = new Decimal(prevQty).times(new Decimal(prevCost))
    const total = new Decimal(additionalCost).plus(prevTotalCost)
    const costPerItem = total.dividedBy(new Decimal(newQty))

    return costPerItem
  }

  function calcChange(cash, total) {
    return new Decimal(cash).minus(new Decimal(total))
  }

  function calcDiscountedItemPrice(price, discount) {
    const formatPrice = new Decimal(price)
    const floatDiscount = new Decimal(discount).div(100)

    return formatPrice.minus(formatPrice.times(floatDiscount)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  function calcProduct(key, transactions, layaways, type = 'daily') {
    let data = {};
    const calcProduct = (items) => {
      let profit = new Decimal(0);
      items.forEach(item => {
        if (item.key === String(key)) {
          const price = new Decimal(item.new_price ? item.new_price : item.price);
          const cost = new Decimal(item.cost);
          profit = profit.plus(price.minus(cost));
        }
      });
      return profit;
    };
  
    // Combine transactions and paid layaways
    [...transactions, ...layaways.filter(l => l.status === 'paid')].forEach(entry => {
      const date = moment.utc(entry.timestamp); // Use UTC if timestamps are in UTC
      let keyDate;
  
      switch (type) {
        case 'daily':
          keyDate = date.format('YYYY-MM-DD');
          break;
        case 'monthly':
          keyDate = date.format('YYYY-MM');
          break;
        case 'yearly':
          keyDate = date.format('YYYY');
          break;
        default:
          throw new Error('Invalid time scale type');
      }
  
      // Debug: Log date and keyDate to check if they're as expected
      // console.log('Date:', date.format(), 'KeyDate:', keyDate);
  
      if (!data[keyDate]) {
        data[keyDate] = new Decimal(0);
      }
      data[keyDate] = data[keyDate].plus(calcProduct(entry.items));
    });
  
    // Convert data to array for ApexCharts, ensure x is timestamp
    return Object.entries(data).map(([date, profit]) => ({
      x: moment(date).valueOf(), // Ensure this matches your keyDate format
      y: profit.toNumber()
    })).sort((a, b) => a.x - b.x); // Sort by date
  }
  

  return {
    calcSubtotal,
    calcDictSubtotal,
    calcTaxTotal,
    calcTotal,
    calcTotalCost,
    calcAvgCostPerItem,
    calcChange,
    calcProduct,
    calcDiscountedItemPrice
  }
}