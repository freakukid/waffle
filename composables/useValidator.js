export default () => {
    const validateEmail = (rule, val, callback) => {
      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val)) {
        callback(new Error('E-mail must be valid'))
      }
    }

    const validateOptionalEmail = (rule, val, callback) => {
      if(val === '')
        return
      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val)) {
        callback(new Error('E-mail must be valid'))
      }
    }

    const validateUsername = (rule, val, callback) => {
      if (!/^[a-zA-Z0-9]+$/.test(val)) {
        callback(new Error('Username can only contain letters and numbers'))
      }
    }
  
    return {
      validateUsername,
      validateEmail,
      validateOptionalEmail
    }
  }