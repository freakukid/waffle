import { ElNotification } from 'element-plus'

export default () => {
  const { $t, $td } = useNuxtApp()
  const { calcSubtotal, calcTaxTotal, calcTotal, calcChange } = useCalculations()
  
  const copyToClipboard = (text) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }

  function sendNotification(message, type) {
    if(type === 'error')
      ElNotification({ title: $t('server.Error'), message: $t(`server.invalid.${message}`), type: type})
    else if(type === 'success')
      ElNotification({ title: $t('server.Success'), message: $t(`server.valid.${message}`), type: type})
  }

  function sendFrontendNotification(message, type, param = {}) {
    if(type === 'error')
      ElNotification({ title: $t('server.Error'), message: $t(`frontend.invalid.${message}`, param), type: type})
    else if(type === 'success')
      ElNotification({ title: $t('server.Success'), message: $t(`frontend.valid.${message}`, param), type: type})
    else if(type === 'offline_success')
      ElNotification({ title: $t('server.Offline Success'), message: $t(`frontend.valid.${message}`, param), type: 'success'})
    else if(type === 'warning')
      ElNotification({ title: $t('server.Warning'), message: $t(`frontend.warning.${message}`, param), type: type})
  }

  function getLogDescription(logs) {
    for (const log of logs) {
      log.date = $td(log.timestamp, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

      if(!log.user)
        log.user = log.user || { name: log.name }
  
      //Setup data
      if(log.action === 'import')
        log.description = $t('import')
      else if(log.action === 'add_column')
        log.description = $t('add_column', { after: log.after.title })
      else if(log.action === 'edit_column') {
        let html = ``
        for (let beforeString in log.after) {
          const afterString = log.after[beforeString]
          html += $t('edit_column', { before: beforeString, after: afterString })
        }
        log.description = html
      } else if(log.action === 'delete_column')
        log.description = $t('delete_column', { before: log.before.title })
      else if(log.action === 'add_row') {
        let html = $t('add_row')
        for (let column in log.after) {
          const value = log.after[column]
          if(value) {
            html += `<div>${column}: <b>${value}</b>`
          }
        }
        log.description = html
      } else if(log.action === 'edit_row') {
        let html = ''
        if(log.before.name) {
          html = $t('edit_row_1', { before: log.before.name })
        } else {
          html = $t('edit_row_2')
        }        
        
        for (let column in log.before.item) {
          const beforeValue = log.before.item[column]
          const afterValue = log.after.item[column]
          if(beforeValue !== afterValue) {
            html += $t('edit_row_3', { column: column, before: beforeValue, after: afterValue })
          }
        }
        log.description = html
      } else if(log.action === 'delete_row') {
        let html = $t('delete_row')
        for (let column in log.before) {
          const value = log.before[column]
          if(value) {
            html += `<div>${column}: <b>${value}</b>`
          }
        }
        log.description = html
      } else if(log.action === 'receiving') {
        let html = $t('receiving', { name: log.after.name, qty: log.after.qty, total_cost: log.after.total_cost, before_cost: log.before.cost, after_cost: log.after.cost })
  
        log.description = html
      }
    }

    return logs
  }

  return {
    copyToClipboard,
    getLogDescription,
    sendNotification,
    sendFrontendNotification
  }
}