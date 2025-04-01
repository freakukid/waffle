import { Decimal } from 'decimal.js'
import moment from 'moment'

export default () => {
  const { $td } = useNuxtApp()

  function calcDiscount(givenPrice, givenDiscount, discountType) {
    const price = new Decimal(givenPrice)
    let discount = new Decimal(givenDiscount)

    if(discountType === 'percent') {
      return price.minus((price.times(discount.div(100)))).toFixed(2)
    } else {
      return price.minus(discount).toFixed(2)
    }
  }

  function calcTransactions(transactions) {
    for (const transaction of transactions) {
      const { items, discount, discount_type, tax, cash, card, check } = transaction
      let subtotal = new Decimal(0)
      let subtotalWithoutDiscount = new Decimal(0)
      let totalCost = new Decimal(0)
      // console.log(JSON.stringify(transaction))
      for (const item of Object.values(items)) {
        const qty = new Decimal(item.qty)
        const price = new Decimal(item.price)
        const discount = new Decimal(item.discount)
        const cost = new Decimal(item.cost)
        
        //Add to total cost
        totalCost = totalCost.plus(cost.times(qty))

        //Calc subtotal
        if(discount > 0) {
          const newPrice = new Decimal(calcDiscount(price, discount, item.discount_type))
          item.new_price = newPrice.toFixed(2)
          subtotal = subtotal.plus(newPrice.times(qty))
        } else {
          subtotal = subtotal.plus(price.times(qty))
        }

        //Calc subtotal without discounts
        subtotalWithoutDiscount = subtotalWithoutDiscount.plus(price.times(qty))
      }

      //Do calculations with transaction discount
      if(discount > 0)
        subtotal = new Decimal(calcDiscount(subtotal, discount, discount_type))

      //Calc savings, tax, total
      transaction.date = $td(transaction.timestamp, { year: 'numeric', month: 'long', day: 'numeric' })
      transaction.savings = (subtotalWithoutDiscount.minus(subtotal)).toFixed(2)
      transaction.profit = (subtotal.minus(totalCost)).toFixed(2)
      transaction.subtotal = subtotal.toFixed(2)
      transaction.tax_total = (calcTaxTotal(subtotal, tax)).toFixed(2)
      transaction.total = (calcTotal(subtotal, transaction.tax_total)).toFixed(2)
      transaction.change = (calcChange(new Decimal(cash).plus(new Decimal(card)).plus(new Decimal(check)), transaction.total)).toFixed(2)
    }

    return transactions

    //Test data
    // console.log(JSON.stringify(transactions))
  }

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

      if (discount > 0) {
        const discountSubtotalPrice = itemSubtotal.minus(itemSubtotal.times(discount))
        const newPrice = price.minus(price.times(discount))
        discountSubtotal = discountSubtotal.plus(discountSubtotalPrice)
        item['new_price'] = newPrice.toFixed(2)
        item['subtotal'] = newPrice.times(qty).toFixed(2)
        totalPrice = totalPrice.plus(discountSubtotalPrice)
      } else {
        item['subtotal'] = itemSubtotal.toFixed(2)
        discountSubtotal = discountSubtotal.plus(itemSubtotal)
        totalPrice = totalPrice.plus(itemSubtotal)
      }
    }

    return { subtotal: discountSubtotal, noDiscountSubtotal: noDiscountSubtotal, savings: noDiscountSubtotal.minus(discountSubtotal), profit: totalPrice.minus(totalCost) }
  }

  function calcTaxTotal(subtotal, tax) {
    return new Decimal(subtotal).times(new Decimal(tax).div(100))
  }

  function calcTotal(subtotal, taxTotal) {
    return new Decimal(subtotal).plus(taxTotal)
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

  function calcProduct(key, transactions, layaways, type = 'Week') {
    let chartData = {}
    const combinedEntries = [...transactions, ...layaways.filter(l => l.status === 'paid')]
    const endDate = moment().endOf('day')
    let totalPrice = new Decimal(0)
    let totalProfit = new Decimal(0)
    let totalQuantity = 0

    const calcProfit = (items) => {
      let profit = new Decimal(0)
      items.forEach(item => {
        if (item.key === String(key)) {
          const price = new Decimal(item.new_price ? item.new_price : item.price)
          const cost = new Decimal(item.cost)
          profit = profit.plus((price.minus(cost)).times(item.qty))
          totalPrice = totalPrice.plus(price.times(item.qty))
          totalProfit = totalProfit.plus(profit)
          totalQuantity += parseInt(item.qty)
        }
      })
      return profit
    }

    // Determine the start date
    let startDate
    switch (type) {
      case 'Week':
        startDate = endDate.clone().subtract(7, 'days').startOf('day')
        break
      case 'Month':
        startDate = endDate.clone().subtract(1, 'month').startOf('day')
        break
      case 'Year':
        startDate = endDate.clone().subtract(1, 'year').startOf('month')
        break
    }

    let currentDate = startDate.clone()
    if (type === 'Week') {
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
    } else if (type === 'Month') {
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
    } else if (type === 'Year') {
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

    const dataForChart = Object.entries(chartData).map(([timestamp, { profit, end }]) => ({
      x: parseInt(timestamp),
      y: profit,
      end: end
    })).sort((a, b) => a.x - b.x)

    return {
      chart_data: dataForChart,
      total_price: totalPrice.toFixed(2),
      total_profit: totalProfit.toFixed(2),
      total_qty: totalQuantity,
    }
  }

  function calcStore(transactions, layaways, stock, type = 'Week') {
    let chartData = {}
    const combinedEntries = [...transactions, ...layaways.filter(l => l.status === 'paid')]
    const endDate = moment().endOf('day')
    let totalTransactions = 0
    let totalPrice = new Decimal(0)
    let totalProfit = new Decimal(0)
    let totalCost = new Decimal(0)
    let totalCard = new Decimal(0)
    let totalCash = new Decimal(0)
    let totalCheck = new Decimal(0)

    // Reset total_profit and total_sold for all stock items
    Object.keys(stock).forEach(key => {
      stock[key].total_profit = new Decimal(0)
      stock[key].total_sold = 0
    })

    // Helper function to process items for an entry
    const processEntryItems = (entry) => {
      for (const entryItem of entry.items) {
        const key = entryItem.key
        const price = new Decimal(entryItem.new_price ? entryItem.new_price : entryItem.price)
        const cost = new Decimal(entryItem.cost)
        stock[key].total_profit = (stock[key].total_profit || 0).plus((price.minus(cost)).times(entryItem.qty))
        stock[key].total_sold = (stock[key].total_sold || 0) + entryItem.qty
        totalCost = totalCost.plus(cost.times(entryItem.qty))
      }
    }

    // Helper function to process entries between dates
    const processDateRange = (startDate, endDate) => {
      let profit = new Decimal(0)
      
      for (let entry of combinedEntries) {
        const entryDate = moment(entry.timestamp)
        if (entryDate.isBetween(startDate, endDate, null, '[)')) {
          profit = profit.plus(entry.profit)
          totalProfit = totalProfit.plus(entry.profit)
          totalPrice = totalPrice.plus(entry.total)
          totalCard = entry.payment === 'card' ? totalCard.plus(new Decimal(entry.total)) : totalCard
          totalCash = entry.payment === 'cash' ? totalCash.plus(new Decimal(entry.total)) : totalCash
          totalCheck = entry.payment === 'check' ? totalCheck.plus(new Decimal(entry.total)) : totalCheck
          totalTransactions++
          processEntryItems(entry)
        }
      }
      
      return profit
    }

    // Determine the start date and increment unit based on type
    const timeConfig = {
      Week: { 
        start: endDate.clone().subtract(7, 'days').startOf('day'),
        increment: 'day',
        incrementCount: 1
      },
      Month: { 
        start: endDate.clone().subtract(1, 'month').startOf('day'),
        increment: 'week',
        incrementCount: 1
      },
      Year: { 
        start: endDate.clone().subtract(1, 'year').startOf('month'),
        increment: 'month',
        incrementCount: 1
      }
    }[type]

    let currentDate = timeConfig.start.clone()

    // Special handling for Month type due to weeks
    if (type === 'Month') {
      let weekCount = 0
      while (weekCount < 5 && currentDate.isSameOrBefore(endDate, 'day')) {
        const currentEndTime = weekCount < 4 ? currentDate.clone().add(7, 'day') : endDate
        const profit = processDateRange(currentDate, currentEndTime)
        
        chartData[currentDate.valueOf()] = {
          profit: profit.toNumber(),
          end: currentEndTime.valueOf()
        }

        if (weekCount < 4)
          currentDate.add(1, 'week')  
        else
          break

        weekCount++
      }
    } else {
      // Handle Week and Year types
      while (currentDate.isSameOrBefore(endDate, 'day')) {
        const currentEndTime = currentDate.clone().add(timeConfig.incrementCount, timeConfig.increment)
        const profit = processDateRange(currentDate, currentEndTime)
        
        chartData[currentDate.valueOf()] = {
          profit: profit.toNumber(),
          end: currentEndTime.valueOf()
        }

        currentDate.add(timeConfig.incrementCount, timeConfig.increment)
      }
    }

    const dataForChart = Object.entries(chartData).map(([timestamp, { profit, end }]) => ({
      x: parseInt(timestamp),
      y: profit,
      end: end
    })).sort((a, b) => a.x - b.x)

    return {
      chart_data: dataForChart,
      total_price: totalPrice.toFixed(2),
      total_profit: totalProfit.toFixed(2),
      total_cost: totalCost.toFixed(2),
      total_transactions: totalTransactions,
      total_card: totalCard.toFixed(2),
      total_cash: totalCash.toFixed(2),
      total_check: totalCheck.toFixed(2)
    }
  }

  return {
    calcSubtotal,
    calcTaxTotal,
    calcTotal,
    calcTotalCost,
    calcAvgCostPerItem,
    calcChange,
    calcProduct,
    calcStore,
    calcDiscount,
    calcTransactions
  }
}