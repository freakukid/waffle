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

  function calcProduct(key, transactions, layaways, type = 'week') {
    let chartData = {}
    const combinedEntries = [...transactions, ...layaways.filter(l => l.status === 'paid')]
    const endDate = moment().endOf('day')
    const calcProfit = (items) => {
      let profit = new Decimal(0)
      items.forEach(item => {
        if (item.key === String(key)) {
          const price = new Decimal(item.new_price ? item.new_price : item.price)
          const cost = new Decimal(item.cost)
          profit = profit.plus((price.minus(cost)).times(item.qty))
        }
      })
      return profit
    }

    // Determine the start date
    let startDate
    switch(type) {
      case 'week':
        startDate = endDate.clone().subtract(7, 'days').startOf('day')
        break
      case 'month':
        startDate = endDate.clone().subtract(1, 'month').startOf('day')
        break
      case 'year':
        startDate = endDate.clone().subtract(1, 'year').startOf('month')
        break
    }

    // Loop until currentDate goes past endDate
    let currentDate = startDate.clone()
    if(type === 'week') {
      while (currentDate.isSameOrBefore(endDate, 'day')) {
        let profit = new Decimal(0)
        const currentEndTime = currentDate.clone().add(1, 'day')

        // Loop through combined entries checking if timestamp is between currentDate and currentEndTime. If it is add to profit, if not do nothing
        for (let entry of combinedEntries) {
          const entryDate = moment(entry.timestamp)
          if (entryDate.isBetween(currentDate, currentEndTime, null, '[)')) {
            const itemsProfit = calcProfit(entry.items)
            profit = profit.plus(itemsProfit)
          }
        }

        // Now update the chartData suitable for apex chart of the end date
        chartData[currentDate.valueOf()] = {
          profit: profit.toNumber(),
          end: currentEndTime.valueOf()
        }

        // Increment currentDate by one day
        currentDate.add(1, 'day')

        // Test Data
        // console.log(currentDate.format('YYYY-MM-DD'), 'Profit:', profit.toNumber())
      }
    } else if(type === 'month') {
      let weekCount = 0
      while (currentDate.isSameOrBefore(endDate, 'day')) {
        let profit = new Decimal(0)
        let currentEndTime

        if (weekCount < 4) { // For the first 4 weeks
          currentEndTime = currentDate.clone().add(7, 'day')
        } else { // For the last (partial) week, go up to endDate
          currentEndTime = endDate
        }

        // Loop through combined entries checking if timestamp is between currentDate and currentEndTime. If it is add to profit, if not do nothing
        for (let entry of combinedEntries) {
          const entryDate = moment(entry.timestamp)
          if (entryDate.isBetween(currentDate, currentEndTime, null, '[)')) {
            const itemsProfit = calcProfit(entry.items)
            profit = profit.plus(itemsProfit)
          }
        }

        // Now update the chartData suitable for ApexCharts of the end date
        chartData[currentDate.valueOf()] = {
          profit: profit.toNumber(),
          end: currentEndTime.valueOf()
        }

        // Increment currentDate by one week, but check if it's the last iteration
        if (weekCount < 4) {
          currentDate.add(1, 'week')
        } else {
          // Stop the loop after handling the last week
          break
        }

        weekCount++
      }
    } else if(type === 'year') {
      while (currentDate.isSameOrBefore(endDate, 'day')) {
        let profit = new Decimal(0)
        let currentEndTime = currentDate.clone().add(1, 'month')

        // Loop through combined entries checking if timestamp is between currentDate and currentEndTime. If it is add to profit, if not do nothing
        for (let entry of combinedEntries) {
          const entryDate = moment(entry.timestamp)
          if (entryDate.isBetween(currentDate, currentEndTime, null, '[)')) {
            const itemsProfit = calcProfit(entry.items)
            profit = profit.plus(itemsProfit)
          }
        }

        // Now update the chartData suitable for ApexCharts of the end date
        chartData[currentDate.valueOf()] = {
          profit: profit.toNumber(),
          end: currentEndTime.valueOf()
        }

        currentDate.add(1, 'month')
      }
    }
    
    return Object.entries(chartData).map(([timestamp, {profit, end}]) => ({
      x: parseInt(timestamp),
      y: profit,
      end: end
    })).sort((a, b) => a.x - b.x)
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