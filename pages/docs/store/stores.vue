<template>
  <DocsLayout active-path="/docs/store/stores">
    <div class="docs-page">
      <h1 class="page-title">Store API</h1>
      <p class="page-description">
        Manage your stores with these endpoints. Create, read, update, and delete stores.
      </p>

      <!-- Endpoints Overview -->
      <section class="doc-section">
        <h2>Endpoints</h2>
        <div class="endpoints-table">
          <div class="endpoint-row" @click="scrollTo('get-stores')">
            <span class="method get">GET</span>
            <code>/api/protected/store/stores</code>
            <span class="desc">List all stores</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('get-store')">
            <span class="method get">GET</span>
            <code>/api/protected/store/[id]</code>
            <span class="desc">Get single store</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('create-store')">
            <span class="method post">POST</span>
            <code>/api/protected/store/create</code>
            <span class="desc">Create a store</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('edit-store')">
            <span class="method post">POST</span>
            <code>/api/protected/store/edit</code>
            <span class="desc">Update a store</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('delete-store')">
            <span class="method post">POST</span>
            <code>/api/protected/store/delete</code>
            <span class="desc">Delete a store</span>
          </div>
        </div>
      </section>

      <!-- GET /stores -->
      <section id="get-stores" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <h2>/api/protected/store/stores</h2>
        </div>
        <p>Retrieve all stores owned by the authenticated user.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role.</p>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X GET "https://legitski.com/api/protected/store/stores" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key"</code></pre>
          <button class="copy-btn" @click="copyCode('get-stores')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>[
  {
    "id": 1,
    "name": "My Store",
    "code": "AbCMyS",
    "boss_id": 1,
    "tax": 0,
    "header": null,
    "footer": null,
    "invoice_notes": null,
    "phone": "",
    "email": "",
    "website": "",
    "address": "",
    "city": "",
    "zipcode": "",
    "state": "",
    "country": "",
    "workers": []
  }
]</code></pre>
        </div>
      </section>

      <!-- GET /store/[id] -->
      <section id="get-store" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <h2>/api/protected/store/[id]</h2>
        </div>
        <p>Retrieve a specific store with its inventory.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> (owner) or <code class="inline-code">Worker</code> role.</p>

        <h3>Path Parameters</h3>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X GET "https://legitski.com/api/protected/store/1" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key"</code></pre>
          <button class="copy-btn" @click="copyCode('get-store')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "id": 1,
  "name": "My Store",
  "code": "AbCMyS",
  "boss_id": 1,
  "tax": 0,
  "phone": "",
  "email": "",
  "website": "",
  "address": "",
  "city": "",
  "zipcode": "",
  "state": "",
  "country": "",
  "inventory": {
    "id": 1,
    "store_id": 1,
    ...
  }
}</code></pre>
        </div>
      </section>

      <!-- POST /store/create -->
      <section id="create-store" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/store/create</h2>
        </div>
        <p>Create a new store.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>name</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Store name (min 2 characters)</span>
          </div>
          <div class="param-row">
            <code>email</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Store email</span>
          </div>
          <div class="param-row">
            <code>phone</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Store phone number</span>
          </div>
          <div class="param-row">
            <code>website</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Store website URL</span>
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
          <pre><code>curl -X POST "https://legitski.com/api/protected/store/create" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "name": "New Store",
    "email": "store@example.com",
    "phone": "555-1234"
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('create-store')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "store": {
    "id": 2,
    "name": "New Store",
    "code": "XyZNew",
    "boss_id": 1,
    "email": "store@example.com",
    "phone": "555-1234",
    "website": null,
    "address": null,
    "city": null,
    "zipcode": null,
    "state": null,
    "country": null,
    "workers": []
  },
  "message": "Store Created!"
}</code></pre>
        </div>
      </section>

      <!-- POST /store/edit -->
      <section id="edit-store" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/store/edit</h2>
        </div>
        <p>Update an existing store.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role (must be store owner).</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>Store ID to update</span>
          </div>
          <div class="param-row">
            <code>name</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Store name (min 2 characters)</span>
          </div>
          <div class="param-row">
            <code>email</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Store email</span>
          </div>
          <div class="param-row">
            <code>phone</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Store phone number</span>
          </div>
          <div class="param-row">
            <code>website</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Store website URL</span>
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
          <pre><code>curl -X POST "https://legitski.com/api/protected/store/edit" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "id": 1,
    "name": "Updated Store Name",
    "phone": "555-9999"
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('edit-store')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "store": {
    "id": 1,
    "name": "Updated Store Name",
    "code": "AbCMyS",
    "boss_id": 1,
    "phone": "555-9999",
    ...
  },
  "message": "Store Updated!"
}</code></pre>
        </div>
      </section>

      <!-- POST /store/delete -->
      <section id="delete-store" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post delete">POST</span>
          <h2>/api/protected/store/delete</h2>
        </div>
        <p>Delete a store and all associated data.</p>

        <div class="warning-box">
          <Icon name="mdi:alert" class="warning-icon" />
          <div>
            <strong>Warning: Destructive Action</strong>
            <p>This will permanently delete the store along with all logs, workers, and associated data. This cannot be undone.</p>
          </div>
        </div>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role (must be store owner).</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>Store ID to delete</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/store/delete" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"id": 1}'</code></pre>
          <button class="copy-btn" @click="copyCode('delete-store')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "store_id": 1,
  "message": "Store Deleted!"
}</code></pre>
        </div>
      </section>

      <!-- Store Object -->
      <section class="doc-section">
        <h2>Store Object</h2>
        <p>The complete store object structure:</p>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Unique store identifier</span>
          </div>
          <div class="param-row">
            <code>name</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Store name</span>
          </div>
          <div class="param-row">
            <code>code</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Unique auto-generated store code</span>
          </div>
          <div class="param-row">
            <code>boss_id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Owner's boss ID</span>
          </div>
          <div class="param-row">
            <code>tax</code>
            <span class="param-type">float</span>
            <span></span>
            <span>Tax rate (default: 0)</span>
          </div>
          <div class="param-row">
            <code>header</code>
            <span class="param-type">json</span>
            <span></span>
            <span>Receipt header configuration</span>
          </div>
          <div class="param-row">
            <code>footer</code>
            <span class="param-type">json</span>
            <span></span>
            <span>Receipt footer configuration</span>
          </div>
          <div class="param-row">
            <code>invoice_notes</code>
            <span class="param-type">json</span>
            <span></span>
            <span>Invoice notes configuration</span>
          </div>
          <div class="param-row">
            <code>phone</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Store phone number</span>
          </div>
          <div class="param-row">
            <code>email</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Store email</span>
          </div>
          <div class="param-row">
            <code>website</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Store website</span>
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
            <code>workers</code>
            <span class="param-type">array</span>
            <span></span>
            <span>Array of worker objects</span>
          </div>
          <div class="param-row">
            <code>inventory</code>
            <span class="param-type">object</span>
            <span></span>
            <span>Store inventory (when fetching single store)</span>
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

const copyCode = async (section) => {
  const codeBlocks = {
    'get-stores': `curl -X GET "https://legitski.com/api/protected/store/stores" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key"`,
    'get-store': `curl -X GET "https://legitski.com/api/protected/store/1" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key"`,
    'create-store': `curl -X POST "https://legitski.com/api/protected/store/create" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "name": "New Store",
    "email": "store@example.com",
    "phone": "555-1234"
  }'`,
    'edit-store': `curl -X POST "https://legitski.com/api/protected/store/edit" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "id": 1,
    "name": "Updated Store Name",
    "phone": "555-9999"
  }'`,
    'delete-store': `curl -X POST "https://legitski.com/api/protected/store/delete" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{"id": 1}'`
  }

  try {
    await navigator.clipboard.writeText(codeBlocks[section])
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
  grid-template-columns: 120px 80px 80px 1fr;
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
