<template>
  <DocsLayout active-path="/docs/customers">
    <div class="docs-page">
      <h1 class="page-title">Customers API</h1>
      <p class="page-description">
        Manage customer records for your store. Create, update, delete, and list customers for use with layaway transactions.
      </p>

      <!-- Endpoints Overview -->
      <section class="doc-section">
        <h2>Endpoints</h2>
        <div class="endpoints-table">
          <div class="endpoint-row" @click="scrollTo('get-customers')">
            <span class="method get">GET</span>
            <code>/api/protected/customer/[store_id]</code>
            <span class="desc">List customers</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('create-customer')">
            <span class="method post">POST</span>
            <code>/api/protected/customer/create</code>
            <span class="desc">Create customer</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('edit-customer')">
            <span class="method post">POST</span>
            <code>/api/protected/customer/edit</code>
            <span class="desc">Update customer</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('delete-customer')">
            <span class="method post delete">POST</span>
            <code>/api/protected/customer/delete</code>
            <span class="desc">Delete customer</span>
          </div>
        </div>
      </section>

      <!-- GET /customer/[store_id] -->
      <section id="get-customers" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <h2>/api/protected/customer/[store_id]</h2>
        </div>
        <p>Retrieve all customers for a store, sorted by ID ascending.</p>

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
          <pre><code>curl -X GET "https://legitski.com/api/protected/customer/1" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key"</code></pre>
          <button class="copy-btn" @click="copyCode('get-customers')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>[
  {
    "id": 1,
    "store_id": 1,
    "name": "John Smith",
    "company": "Smith Co.",
    "phone": "555-1234",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "zipcode": "10001",
    "state": "NY",
    "country": "USA",
    "layaways": []
  }
]</code></pre>
        </div>
      </section>

      <!-- POST /customer/create -->
      <section id="create-customer" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/customer/create</h2>
        </div>
        <p>Create a new customer for a store.</p>

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
            <code>name</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Customer name</span>
          </div>
          <div class="param-row">
            <code>company</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Company name</span>
          </div>
          <div class="param-row">
            <code>phone</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Phone number</span>
          </div>
          <div class="param-row">
            <code>email</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Email address</span>
          </div>
          <div class="param-row">
            <code>address</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Street address</span>
          </div>
          <div class="param-row">
            <code>city</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>City</span>
          </div>
          <div class="param-row">
            <code>state</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>State/Province</span>
          </div>
          <div class="param-row">
            <code>zipcode</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>ZIP/Postal code</span>
          </div>
          <div class="param-row">
            <code>country</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Country</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/customer/create" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "555-1234",
    "company": "Smith Co."
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('create-customer')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "customer": {
    "id": 1,
    "store_id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "555-1234",
    "company": "Smith Co.",
    "address": "",
    "city": "",
    "zipcode": "",
    "state": "",
    "country": "",
    "layaways": []
  },
  "message": "Customer Created!"
}</code></pre>
        </div>
      </section>

      <!-- POST /customer/edit -->
      <section id="edit-customer" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/customer/edit</h2>
        </div>
        <p>Update an existing customer's information.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">make_transactions</code> permission.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>Customer ID to update</span>
          </div>
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>name</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Customer name</span>
          </div>
          <div class="param-row">
            <code>company</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Company name</span>
          </div>
          <div class="param-row">
            <code>phone</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Phone number</span>
          </div>
          <div class="param-row">
            <code>email</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Email address</span>
          </div>
          <div class="param-row">
            <code>address</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Street address</span>
          </div>
          <div class="param-row">
            <code>city</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>City</span>
          </div>
          <div class="param-row">
            <code>state</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>State/Province</span>
          </div>
          <div class="param-row">
            <code>zipcode</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>ZIP/Postal code</span>
          </div>
          <div class="param-row">
            <code>country</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Country</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/customer/edit" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "id": 1,
    "store_id": 1,
    "name": "John Smith Jr.",
    "email": "john.jr@example.com",
    "phone": "555-5678"
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('edit-customer')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "customer": {
    "id": 1,
    "store_id": 1,
    "name": "John Smith Jr.",
    "email": "john.jr@example.com",
    "phone": "555-5678",
    ...
  },
  "message": "Customer Updated!"
}</code></pre>
        </div>
      </section>

      <!-- POST /customer/delete -->
      <section id="delete-customer" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post delete">POST</span>
          <h2>/api/protected/customer/delete</h2>
        </div>
        <p>Delete a customer from the store.</p>

        <div class="warning-box">
          <Icon name="mdi:alert" class="warning-icon" />
          <div>
            <strong>Cannot Delete with Layaways</strong>
            <p>Customers with associated layaway transactions cannot be deleted. You must first delete or reassign their layaways.</p>
          </div>
        </div>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">make_transactions</code> permission.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>Customer ID to delete</span>
          </div>
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>name</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Customer name (for validation)</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/customer/delete" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "id": 1,
    "store_id": 1,
    "name": "John Smith"
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('delete-customer')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "message": "Customer Deleted!"
}</code></pre>
        </div>

        <h3>Error Response (Has Layaways)</h3>
        <div class="code-block">
          <pre><code>{
  "statusCode": 400,
  "statusMessage": "Unable to delete customer: associated layaway transactions exist"
}</code></pre>
        </div>
      </section>

      <!-- Customer Object -->
      <section class="doc-section">
        <h2>Customer Object</h2>
        <p>The complete customer object structure:</p>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Unique customer identifier</span>
          </div>
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Associated store ID</span>
          </div>
          <div class="param-row">
            <code>name</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Customer name</span>
          </div>
          <div class="param-row">
            <code>company</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Company name</span>
          </div>
          <div class="param-row">
            <code>phone</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Phone number</span>
          </div>
          <div class="param-row">
            <code>email</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Email address</span>
          </div>
          <div class="param-row">
            <code>address</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Street address</span>
          </div>
          <div class="param-row">
            <code>city</code>
            <span class="param-type">string</span>
            <span></span>
            <span>City</span>
          </div>
          <div class="param-row">
            <code>state</code>
            <span class="param-type">string</span>
            <span></span>
            <span>State/Province</span>
          </div>
          <div class="param-row">
            <code>zipcode</code>
            <span class="param-type">string</span>
            <span></span>
            <span>ZIP/Postal code</span>
          </div>
          <div class="param-row">
            <code>country</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Country</span>
          </div>
          <div class="param-row">
            <code>layaways</code>
            <span class="param-type">array</span>
            <span></span>
            <span>Associated layaway transactions</span>
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
  'get-customers': `curl -X GET "https://legitski.com/api/protected/customer/1" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key"`,
  'create-customer': `curl -X POST "https://legitski.com/api/protected/customer/create" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "555-1234",
    "company": "Smith Co."
  }'`,
  'edit-customer': `curl -X POST "https://legitski.com/api/protected/customer/edit" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "id": 1,
    "store_id": 1,
    "name": "John Smith Jr.",
    "email": "john.jr@example.com",
    "phone": "555-5678"
  }'`,
  'delete-customer': `curl -X POST "https://legitski.com/api/protected/customer/delete" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "id": 1,
    "store_id": 1,
    "name": "John Smith"
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

  &.delete {
    background: rgba(245, 108, 108, 0.15);
    color: #F56C6C;
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

.warning-box {
  display: flex;
  gap: 12px;
  background: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;

  .warning-icon {
    color: #F56C6C;
    font-size: 20px;
    flex-shrink: 0;
  }

  strong {
    color: #F56C6C;
    display: block;
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}
</style>
