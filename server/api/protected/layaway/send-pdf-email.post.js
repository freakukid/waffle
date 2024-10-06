import useAuthChecks from '../../composables/useAuthChecks'
import nodemailer from 'nodemailer'
import { readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  //Imports
  const { getAuthUser, isStoreOwner, isStoreWorker, getWorkerPermissions } = useAuthChecks()
  //Setup data
  const authUser = await getAuthUser(event)
  
  // Read multipart form data
  const formData = await readMultipartFormData(event)
  const data = {}
  const expectedFields = ['pdf', 'store_id', 'store_name', 'email', 'invoice_id']
  for (const field of formData) {
    const { name, data: fieldData } = field
    // Store data only if the field is expected
    if (expectedFields.includes(name)) {
      data[name] = (name === 'pdf') ? fieldData : fieldData.toString('utf-8')
    }
  }
  const { pdf, store_id, store_name, email, invoice_id } = data
  // Read multipart form data

  const isValidWorker = isStoreWorker(authUser, store_id)
  
  //Check if we have required fields
  if (!pdf || !store_id || !store_name || !email || !invoice_id)
    return { statusCode: 400, statusMessage: `Required: pdf, store_id, store_name, email, invoice_id.` }

  //Check if this user has access rights to this store
  if(!isStoreOwner(authUser, store_id) && !isValidWorker)
    return { statusCode: 400, statusMessage: `You do not have access rights to make this transaction.` }

  //Check if this worker has permission to commit this action
  if(isValidWorker) {
    const permissions = await getWorkerPermissions(authUser.worker.id)
    if(!permissions.make_transactions)
      return { statusCode: 400, statusMessage: `You do not have the rights to make this transaction.` }
  }

  // Create a transporter object
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password
    }
  })

  // Configure email options
  const mailOptions = {
    from: 'your-alias-email@gmail.com',
    to: email,
    subject: `Invoice from ${store_name}`,
    text: 'The pdf invoice is attached to this email!',
    attachments: [{
      filename: `invoice-${invoice_id}`,
      content: Buffer.from(pdf),
      contentType: 'application/pdf',
    }]
  }

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions)
    setResponseStatus(event, 201)
    return { message: "Email sent" }
  } catch (error) {
    console.error('Error occurred: ' + error.message)
    setResponseStatus(event, 500)
    return { statusCode: 500, statusMessage: 'Failed to send email: ' + error.message }
  }
})

