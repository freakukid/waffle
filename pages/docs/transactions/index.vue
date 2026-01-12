<template>
  <DocsLayout active-path="/docs/transactions">
    <div class="docs-page">
      <h1 class="page-title">Transactions API</h1>
      <p class="page-description">
        Create and retrieve transactions for your store. Supports multiple payment methods, automatic inventory updates, and receipt printing.
      </p>

      <!-- Endpoints Overview -->
      <section class="doc-section">
        <h2>Endpoints</h2>
        <div class="endpoints-table">
          <div class="endpoint-row" @click="scrollTo('get-transactions')">
            <span class="method get">GET</span>
            <code>/api/protected/transaction/[store_id]</code>
            <span class="desc">List transactions</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('create-transaction')">
            <span class="method post">POST</span>
            <code>/api/protected/transaction/create</code>
            <span class="desc">Create transaction</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('print-receipt')">
            <span class="method post">POST</span>
            <code>/api/protected/transaction/print</code>
            <span class="desc">Print receipt</span>
          </div>
        </div>
      </section>

      <!-- GET /transaction/[store_id] -->
      <section id="get-transactions" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <h2>/api/protected/transaction/[store_id]</h2>
        </div>
        <p>Retrieve all transactions for a store, ordered by most recent first.</p>

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
          <pre><code>curl -X GET "https://legitski.com/api/protected/transaction/1" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key"</code></pre>
          <button class="copy-btn" @click="copyCode('get-transactions')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>[
  {
    "id": 1,
    "timestamp": "2024-01-15T14:30:00.000Z",
    "store_id": 1,
    "user_id": 1,
    "name": "",
    "items": [
      {
        "key": "0",
        "name": "Product A",
        "qty": 2,
        "price": 10.00,
        "discount": 0,
        "discount_type": "percent",
        "cost": 5.00
      }
    ],
    "tax": 8.5,
    "cash": 21.70,
    "card": 0,
    "card_type": "",
    "check": 0,
    "check_number": "",
    "discount": 0,
    "discount_type": "percent",
    "user": {
      "name": "John Doe"
    }
  }
]</code></pre>
        </div>
      </section>

      <!-- POST /transaction/create -->
      <section id="create-transaction" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/transaction/create</h2>
        </div>
        <p>Create a new transaction. Optionally updates inventory quantities automatically.</p>

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
            <code>items</code>
            <span class="param-type">array</span>
            <span class="param-required">required</span>
            <span>Array of transaction items</span>
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
            <span>Tax percentage (default: 0)</span>
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
            <code>card_type</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Card type (visa, mastercard, etc.)</span>
          </div>
          <div class="param-row">
            <code>check</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Check payment amount</span>
          </div>
          <div class="param-row">
            <code>check_number</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Check number</span>
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
            <span>Custom timestamp (defaults to now)</span>
          </div>
        </div>

        <h3>Item Object Structure</h3>
        <div class="code-block">
          <pre><code>{
  "key": "0",           // Inventory item key
  "name": "Product A",  // Item name
  "qty": 2,             // Quantity sold
  "price": 10.00,       // Unit price
  "discount": 0,        // Item discount
  "discount_type": "percent",  // "percent" or "amount"
  "cost": 5.00          // Unit cost (optional)
}</code></pre>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/transaction/create" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "items": [
      {
        "key": "0",
        "name": "Product A",
        "qty": 2,
        "price": 10.00,
        "discount": 0,
        "discount_type": "percent",
        "cost": 5.00
      }
    ],
    "quantity_column": "Qty",
    "tax": 8.5,
    "cash": 21.70,
    "card": 0,
    "discount": 0,
    "discount_type": "percent"
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('create-transaction')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "transaction": {
    "id": 1,
    "timestamp": "2024-01-15T14:30:00.000Z",
    "store_id": 1,
    "user_id": 1,
    "name": "",
    "items": [...],
    "tax": 8.5,
    "cash": 21.70,
    "card": 0,
    "card_type": "",
    "check": 0,
    "check_number": "",
    "discount": 0,
    "discount_type": "percent"
  },
  "inventory": { ... },
  "message": "Transaction Created!"
}</code></pre>
        </div>

        <div class="info-box">
          <Icon name="mdi:information" class="info-icon" />
          <div>
            <strong>Automatic Inventory Updates</strong>
            <p>When <code>quantity_column</code> is provided, item quantities are automatically decremented from inventory stock.</p>
          </div>
        </div>
      </section>

      <!-- POST /transaction/print -->
      <section id="print-receipt" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/transaction/print</h2>
        </div>
        <p>Print a receipt to a configured thermal printer.</p>

        <div class="info-box">
          <Icon name="mdi:printer" class="info-icon" />
          <div>
            <strong>Printer Configuration Required</strong>
            <p>You must have a printer IP address configured in Settings for this endpoint to work. Supports Epson thermal printers via TCP.</p>
          </div>
        </div>

        <h3>Authorization</h3>
        <p>Requires authenticated user with printer IP configured in Settings.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>items</code>
            <span class="param-type">array</span>
            <span class="param-required">required</span>
            <span>Array of items to print</span>
          </div>
          <div class="param-row">
            <code>subtotal</code>
            <span class="param-type">number</span>
            <span class="param-required">required</span>
            <span>Subtotal before tax</span>
          </div>
          <div class="param-row">
            <code>tax</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Tax percentage</span>
          </div>
          <div class="param-row">
            <code>tax_total</code>
            <span class="param-type">number</span>
            <span class="param-required">required</span>
            <span>Tax amount</span>
          </div>
          <div class="param-row">
            <code>total</code>
            <span class="param-type">number</span>
            <span class="param-required">required</span>
            <span>Total amount</span>
          </div>
          <div class="param-row">
            <code>savings</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Total savings from discounts</span>
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
            <code>card_type</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Card type</span>
          </div>
          <div class="param-row">
            <code>check</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Check payment amount</span>
          </div>
          <div class="param-row">
            <code>change</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Change to return</span>
          </div>
          <div class="param-row">
            <code>discount</code>
            <span class="param-type">number</span>
            <span class="param-optional">optional</span>
            <span>Total discount</span>
          </div>
          <div class="param-row">
            <code>discount_type</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>"percent" or "amount"</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/transaction/print" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "items": [
      { "name": "Product A", "qty": 2, "price": 10.00, "discount": 0 }
    ],
    "subtotal": 20.00,
    "tax": 8.5,
    "tax_total": 1.70,
    "total": 21.70,
    "cash": 25.00,
    "change": 3.30
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('print-receipt')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "message": "Receipt Printed!"
}</code></pre>
        </div>
      </section>

      <!-- Payment Methods -->
      <section class="doc-section">
        <h2>Payment Methods</h2>
        <p>Transactions support multiple payment methods that can be combined:</p>
        <div class="params-table">
          <div class="param-row">
            <code>cash</code>
            <span class="param-type">number</span>
            <span></span>
            <span>Cash payment amount</span>
          </div>
          <div class="param-row">
            <code>card</code>
            <span class="param-type">number</span>
            <span></span>
            <span>Card payment with optional card_type</span>
          </div>
          <div class="param-row">
            <code>check</code>
            <span class="param-type">number</span>
            <span></span>
            <span>Check payment with optional check_number</span>
          </div>
        </div>
      </section>

      <!-- Discount Types -->
      <section class="doc-section">
        <h2>Discount Types</h2>
        <p>Both transaction-level and item-level discounts are supported:</p>
        <div class="params-table">
          <div class="param-row">
            <code>percent</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Discount is a percentage (e.g., 10 = 10% off)</span>
          </div>
          <div class="param-row">
            <code>amount</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Discount is a fixed amount (e.g., 5 = $5 off)</span>
          </div>
        </div>
      </section>

      <!-- Transaction Object -->
      <section class="doc-section">
        <h2>Transaction Object</h2>
        <p>The complete transaction object structure:</p>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Unique transaction identifier</span>
          </div>
          <div class="param-row">
            <code>timestamp</code>
            <span class="param-type">datetime</span>
            <span></span>
            <span>Transaction date and time</span>
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
            <span>User who created the transaction</span>
          </div>
          <div class="param-row">
            <code>name</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Transaction name/reference</span>
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
            <span>Tax percentage applied</span>
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
            <code>card_type</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Type of card used</span>
          </div>
          <div class="param-row">
            <code>check</code>
            <span class="param-type">float</span>
            <span></span>
            <span>Check payment amount</span>
          </div>
          <div class="param-row">
            <code>check_number</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Check number</span>
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
  'get-transactions': `curl -X GET "https://legitski.com/api/protected/transaction/1" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key"`,
  'create-transaction': `curl -X POST "https://legitski.com/api/protected/transaction/create" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "items": [
      {
        "key": "0",
        "name": "Product A",
        "qty": 2,
        "price": 10.00,
        "discount": 0,
        "discount_type": "percent",
        "cost": 5.00
      }
    ],
    "quantity_column": "Qty",
    "tax": 8.5,
    "cash": 21.70,
    "card": 0,
    "discount": 0,
    "discount_type": "percent"
  }'`,
  'print-receipt': `curl -X POST "https://legitski.com/api/protected/transaction/print" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "items": [
      { "name": "Product A", "qty": 2, "price": 10.00, "discount": 0 }
    ],
    "subtotal": 20.00,
    "tax": 8.5,
    "tax_total": 1.70,
    "total": 21.70,
    "cash": 25.00,
    "change": 3.30
  }'`
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
