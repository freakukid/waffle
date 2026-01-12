<template>
  <DocsLayout active-path="/docs/layaways">
    <div class="docs-page">
      <h1 class="page-title">Layaways API</h1>
      <p class="page-description">
        Manage layaway transactions for customers. Create layaways, update their status, and send PDF invoices via email.
      </p>

      <!-- Endpoints Overview -->
      <section class="doc-section">
        <h2>Endpoints</h2>
        <div class="endpoints-table">
          <div class="endpoint-row" @click="scrollTo('get-layaways')">
            <span class="method get">GET</span>
            <code>/api/protected/layaway/[store_id]</code>
            <span class="desc">List layaways</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('create-layaway')">
            <span class="method post">POST</span>
            <code>/api/protected/layaway/create</code>
            <span class="desc">Create layaway</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('set-status')">
            <span class="method post">POST</span>
            <code>/api/protected/layaway/set-status</code>
            <span class="desc">Update status</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('send-email')">
            <span class="method post">POST</span>
            <code>/api/protected/layaway/send-pdf-email</code>
            <span class="desc">Email invoice</span>
          </div>
        </div>
      </section>

      <!-- Layaway Statuses -->
      <section class="doc-section">
        <h2>Layaway Statuses</h2>
        <div class="status-badges">
          <div class="status-badge pending">
            <span class="dot"></span>
            <span>pending</span>
            <span class="desc">Default status, awaiting payment</span>
          </div>
          <div class="status-badge paid">
            <span class="dot"></span>
            <span>paid</span>
            <span class="desc">Payment completed</span>
          </div>
          <div class="status-badge declined">
            <span class="dot"></span>
            <span>declined</span>
            <span class="desc">Cancelled, items returned to inventory</span>
          </div>
        </div>
      </section>

      <!-- GET /layaway/[store_id] -->
      <section id="get-layaways" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <h2>/api/protected/layaway/[store_id]</h2>
        </div>
        <p>Retrieve all layaway transactions for a store, ordered by most recent first.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">make_transactions</code> permission.</p>

        <h3>Path Parameters</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X GET "https://legitski.com/api/protected/layaway/1" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key"</code></pre>
          <button class="copy-btn" @click="copyCode('get-layaways')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>[
  {
    "id": 1,
    "timestamp": "2024-01-15T14:30:00.000Z",
    "status": "pending",
    "store_id": 1,
    "user_id": 1,
    "customer_id": 1,
    "name": "",
    "items": [
      {
        "key": "0",
        "name": "Product A",
        "qty": 2,
        "price": 100.00,
        "discount": 0,
        "discount_type": "percent"
      }
    ],
    "tax": 8.5,
    "cash": 0,
    "card": 0,
    "check": 0,
    "card_type": "",
    "check_number": "",
    "discount": 0,
    "discount_type": "percent",
    "user": { "name": "John Doe" },
    "customer": {
      "id": 1,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "555-1234"
    }
  }
]</code></pre>
        </div>
      </section>

      <!-- POST /layaway/create -->
      <section id="create-layaway" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/layaway/create</h2>
        </div>
        <p>Create a new layaway transaction for a customer. Optionally updates inventory.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">make_transactions</code> permission.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>customer_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The customer ID</span>
          </div>
          <div class="param-row">
            <code>items</code>
            <span class="param-type">array</span>
            <span class="param-required">required</span>
            <span>Array of layaway items</span>
          </div>
          <div class="param-row">
            <code>quantity_column</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Column name to decrement quantities</span>
          </div>
          <div class="param-row">
            <code>tax</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Tax percentage</span>
          </div>
          <div class="param-row">
            <code>discount</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Discount amount or percentage</span>
          </div>
          <div class="param-row">
            <code>discount_type</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>"percent" or "amount"</span>
          </div>
          <div class="param-row">
            <code>timestamp</code>
            <span class="param-type">datetime</span>
            <span class="param-optional">optional</span>
            <span>Custom timestamp</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/layaway/create" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "customer_id": 1,
    "items": [
      {
        "key": "0",
        "name": "Product A",
        "qty": 2,
        "price": 100.00,
        "discount": 0,
        "discount_type": "percent"
      }
    ],
    "quantity_column": "Qty",
    "tax": 8.5
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('create-layaway')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "layaway": {
    "id": 1,
    "timestamp": "2024-01-15T14:30:00.000Z",
    "status": "pending",
    "store_id": 1,
    "user_id": 1,
    "customer_id": 1,
    "items": [...],
    "tax": 8.5,
    "discount": 0,
    "discount_type": "percent"
  },
  "inventory": { ... },
  "message": "Layaway Created!"
}</code></pre>
        </div>
      </section>

      <!-- POST /layaway/set-status -->
      <section id="set-status" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/layaway/set-status</h2>
        </div>
        <p>Update the status of a layaway and record payment information. Handles inventory adjustments based on status changes.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">make_transactions</code> permission.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>Layaway ID to update</span>
          </div>
          <div class="param-row">
            <code>status</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>"pending", "paid", or "declined"</span>
          </div>
          <div class="param-row">
            <code>prev_status</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Previous status for validation</span>
          </div>
          <div class="param-row">
            <code>items</code>
            <span class="param-type">array</span>
            <span class="param-required">required</span>
            <span>Items for inventory calculations</span>
          </div>
          <div class="param-row">
            <code>quantity_column</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Column for inventory updates</span>
          </div>
          <div class="param-row">
            <code>cash</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Cash payment amount</span>
          </div>
          <div class="param-row">
            <code>card</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Card payment amount</span>
          </div>
          <div class="param-row">
            <code>check</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Check payment amount</span>
          </div>
        </div>

        <div class="info-box">
          <Icon name="mdi:information" class="info-icon" />
          <div>
            <strong>Inventory Adjustments</strong>
            <p>When changing to <code>declined</code>, items are returned to inventory. When changing from <code>declined</code> to another status, items are removed from inventory again.</p>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/layaway/set-status" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "id": 1,
    "status": "paid",
    "prev_status": "pending",
    "items": [...],
    "cash": 217.00
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('set-status')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "layaway": {
    "id": 1,
    "status": "paid",
    "cash": 217.00,
    "customer": { ... }
  },
  "message": "Layaway Transaction Status: paid!"
}</code></pre>
        </div>
      </section>

      <!-- POST /layaway/send-pdf-email -->
      <section id="send-email" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/layaway/send-pdf-email</h2>
        </div>
        <p>Send a PDF invoice to a customer via email.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">make_transactions</code> permission.</p>

        <h3>Request Body (Multipart Form Data)</h3>
        <div class="params-table">
          <div class="param-row">
            <code>pdf</code>
            <span class="param-type">file</span>
            <span class="param-required">required</span>
            <span>PDF file content</span>
          </div>
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>store_name</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Store name for email subject</span>
          </div>
          <div class="param-row">
            <code>email</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Recipient email address</span>
          </div>
          <div class="param-row">
            <code>invoice_id</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Invoice ID for filename</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/layaway/send-pdf-email" \
  -H "X-API-Key: your_api_key" \
  -F "pdf=@invoice.pdf" \
  -F "store_id=1" \
  -F "store_name=My Store" \
  -F "email=customer@example.com" \
  -F "invoice_id=INV-001"</code></pre>
          <button class="copy-btn" @click="copyCode('send-email')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "message": "Email Sent!"
}</code></pre>
        </div>
      </section>

      <!-- Layaway Object -->
      <section class="doc-section">
        <h2>Layaway Object</h2>
        <p>The complete layaway object structure:</p>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Unique layaway identifier</span>
          </div>
          <div class="param-row">
            <code>timestamp</code>
            <span class="param-type">datetime</span>
            <span></span>
            <span>Creation date and time</span>
          </div>
          <div class="param-row">
            <code>status</code>
            <span class="param-type">string</span>
            <span></span>
            <span>"pending", "paid", or "declined"</span>
          </div>
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Associated store ID</span>
          </div>
          <div class="param-row">
            <code>user_id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>User who created the layaway</span>
          </div>
          <div class="param-row">
            <code>customer_id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Associated customer ID</span>
          </div>
          <div class="param-row">
            <code>name</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Layaway name/reference</span>
          </div>
          <div class="param-row">
            <code>items</code>
            <span class="param-type">array</span>
            <span></span>
            <span>Array of item objects</span>
          </div>
          <div class="param-row">
            <code>tax</code>
            <span class="param-type">float</span>
            <span></span>
            <span>Tax percentage</span>
          </div>
          <div class="param-row">
            <code>cash</code>
            <span class="param-type">float</span>
            <span></span>
            <span>Cash payment amount</span>
          </div>
          <div class="param-row">
            <code>card</code>
            <span class="param-type">float</span>
            <span></span>
            <span>Card payment amount</span>
          </div>
          <div class="param-row">
            <code>check</code>
            <span class="param-type">float</span>
            <span></span>
            <span>Check payment amount</span>
          </div>
          <div class="param-row">
            <code>discount</code>
            <span class="param-type">float</span>
            <span></span>
            <span>Discount applied</span>
          </div>
          <div class="param-row">
            <code>discount_type</code>
            <span class="param-type">string</span>
            <span></span>
            <span>"percent" or "amount"</span>
          </div>
        </div>
      </section>
    </div>
  </DocsLayout>
</template>

<script setup>
definePageMeta({
  middleware: ['language']
})

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

const codeSnippets = {
  'get-layaways': `curl -X GET "https://legitski.com/api/protected/layaway/1" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key"`,
  'create-layaway': `curl -X POST "https://legitski.com/api/protected/layaway/create" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "customer_id": 1,
    "items": [
      {
        "key": "0",
        "name": "Product A",
        "qty": 2,
        "price": 100.00,
        "discount": 0,
        "discount_type": "percent"
      }
    ],
    "quantity_column": "Qty",
    "tax": 8.5
  }'`,
  'set-status': `curl -X POST "https://legitski.com/api/protected/layaway/set-status" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "id": 1,
    "status": "paid",
    "prev_status": "pending",
    "items": [...],
    "cash": 217.00
  }'`,
  'send-email': `curl -X POST "https://legitski.com/api/protected/layaway/send-pdf-email" \\
  -H "X-API-Key: your_api_key" \\
  -F "pdf=@invoice.pdf" \\
  -F "store_id=1" \\
  -F "store_name=My Store" \\
  -F "email=customer@example.com" \\
  -F "invoice_id=INV-001"`
}

const copyCode = async (key) => {
  try {
    await navigator.clipboard.writeText(codeSnippets[key])
    ElMessage.success('Copied to clipboard!')
  } catch (err) {
    ElMessage.error('Failed to copy')
  }
}
</script>

<style lang="scss" scoped>
.docs-page {
  color: #fff;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 40px;
}

.doc-section {
  margin-bottom: 40px;

  h2 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #fff;
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 20px 0 12px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 12px;
  }
}

.endpoint-section {
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.endpoint-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 18px;
  }
}

.endpoints-table {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.endpoint-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &:last-child {
    border-bottom: none;
  }

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
    color: #e0e0e0;
  }

  .desc {
    margin-left: auto;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
  }
}

.method {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;

  &.get {
    background: rgba(103, 194, 58, 0.15);
    color: #67C23A;
  }

  &.post {
    background: rgba(64, 158, 255, 0.15);
    color: #409EFF;
  }
}

.status-badges {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &.pending .dot {
    background: #E6A23C;
  }

  &.paid .dot {
    background: #67C23A;
  }

  &.declined .dot {
    background: #F56C6C;
  }

  span:nth-child(2) {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
    color: #fff;
    min-width: 80px;
  }

  .desc {
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
  }
}

.code-block {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  position: relative;
  overflow-x: auto;

  pre {
    margin: 0;
  }

  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    color: #e0e0e0;
    line-height: 1.5;
  }
}

.copy-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  padding: 6px 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
}

.inline-code {
  background: rgba(64, 158, 255, 0.15);
  color: #409EFF;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.params-table {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.param-row {
  display: grid;
  grid-template-columns: 140px 80px 80px 1fr;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    color: #e0e0e0;
  }

  span:last-child {
    color: rgba(255, 255, 255, 0.6);
  }
}

.param-type {
  color: #409EFF;
  font-size: 12px;
}

.param-required {
  color: #F56C6C;
  font-size: 11px;
  font-weight: 500;
}

.param-optional {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
}

.info-box {
  display: flex;
  gap: 12px;
  background: rgba(64, 158, 255, 0.1);
  border: 1px solid rgba(64, 158, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;

  .info-icon {
    color: #409EFF;
    font-size: 20px;
    flex-shrink: 0;
  }

  strong {
    color: #409EFF;
    display: block;
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: 14px;

    code {
      background: rgba(64, 158, 255, 0.2);
      padding: 1px 4px;
      border-radius: 3px;
    }
  }
}
</style>
