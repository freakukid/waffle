export default () => {
  function formatDate(date) {
    const localDate = new Date(date)
    return `${localDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })}`.replace(/ at /, ', ')
  }

  //Change all name values to strings
  function formatNameColumn(val) {
    return String(val)
  }

  //Change all price values to floats
  function formatPriceColumn(val) {
    return (parseFloat(String(val)) || 0.00).toFixed(2)
  }

  //Change all quantity values to integers. Must be 0 or greater.
  function formatQuantityColumn(val) {
    let qty = parseInt(val) || 0
    return qty < 0 ? 0 : qty
  }

  //Change all discount values to integers. Must be 0 - 100.
  function formatDiscountColumn(val) {
    let discount = parseInt(val) || 0
    return discount < 0 || discount > 100 ? 0 : discount 
  }

  //Change all price values to floats
  function formatCostColumn(val) {
    return (parseFloat(String(val)) || 0.00).toFixed(2)
  }

  //Validates inventory data values
  function validateValues(value) {
    if(typeof value === 'string')
      value = value.trim()
    
    if(typeof value === 'boolean')
      return String(value)
    else if(!value && value !== 0)
      return ''

    var validNumber = (String(value).match(/^-?\d*(\.\d+)?$/))

    if(validNumber) {
      if(String(value).indexOf('.') !== -1) {
        return parseFloat(value)
      } else {
        return parseInt(value)
      }
    }

    return String(value)
  }

  function formatPhoneNumber(phoneNumber) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`
  }

  return {
    formatDate,
    formatNameColumn,
    formatPriceColumn,
    formatQuantityColumn,
    formatDiscountColumn,
    formatCostColumn,
    validateValues,
    formatPhoneNumber,
  }
}