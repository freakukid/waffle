<template>
  <DocsLayout active-path="/docs/logs">
    <div class="docs-page">
      <h1 class="page-title">Logs API</h1>
      <p class="page-description">
        Retrieve inventory activity logs for your store. Track all changes made to inventory items and columns.
      </p>

      <!-- Endpoints Overview -->
      <section class="doc-section">
        <h2>Endpoints</h2>
        <div class="endpoints-table">
          <div class="endpoint-row" @click="scrollTo('get-logs')">
            <span class="method get">GET</span>
            <code>/api/protected/log/[store_id]</code>
            <span class="desc">List activity logs</span>
          </div>
        </div>
      </section>

      <!-- Log Actions -->
      <section class="doc-section">
        <h2>Log Actions</h2>
        <p>The following inventory actions are tracked:</p>
        <div class="actions-grid">
          <div class="action-item">
            <code>import</code>
            <span>Inventory data imported</span>
          </div>
          <div class="action-item">
            <code>add_column</code>
            <span>New column added</span>
          </div>
          <div class="action-item">
            <code>edit_column</code>
            <span>Column renamed</span>
          </div>
          <div class="action-item">
            <code>delete_column</code>
            <span>Column deleted</span>
          </div>
          <div class="action-item">
            <code>add_row</code>
            <span>New item added</span>
          </div>
          <div class="action-item">
            <code>edit_row</code>
            <span>Item modified</span>
          </div>
          <div class="action-item">
            <code>delete_row</code>
            <span>Item deleted</span>
          </div>
          <div class="action-item">
            <code>receiving</code>
            <span>Stock received</span>
          </div>
        </div>
      </section>

      <!-- GET /log/[store_id] -->
      <section id="get-logs" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <h2>/api/protected/log/[store_id]</h2>
        </div>
        <p>Retrieve all activity logs for a store, ordered by most recent first.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">view_log</code> permission.</p>

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
          <pre><code>curl -X GET "https://legitski.com/api/protected/log/1" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key"</code></pre>
          <button class="copy-btn" @click="copyCode('get-logs')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>[
  {
    "id": 5,
    "timestamp": "2024-01-15T14:30:00.000Z",
    "store_id": 1,
    "user_id": 1,
    "name": "",
    "item_id": 0,
    "action": "edit_row",
    "before": {
      "name": "Product A",
      "item": { "Name": "Product A", "Price": "10.00", "Qty": "100" }
    },
    "after": {
      "item": { "Name": "Product A", "Price": "15.00", "Qty": "100" }
    },
    "user": { "name": "John Doe" }
  },
  {
    "id": 4,
    "timestamp": "2024-01-15T14:00:00.000Z",
    "store_id": 1,
    "user_id": 1,
    "name": "",
    "item_id": 0,
    "action": "add_row",
    "before": null,
    "after": { "Name": "Product A", "Price": "10.00", "Qty": "100" },
    "user": { "name": "John Doe" }
  },
  {
    "id": 3,
    "timestamp": "2024-01-15T13:00:00.000Z",
    "store_id": 1,
    "user_id": 1,
    "name": "",
    "item_id": -1,
    "action": "add_column",
    "before": null,
    "after": { "title": "Qty" },
    "user": { "name": "John Doe" }
  }
]</code></pre>
        </div>
      </section>

      <!-- Log Object -->
      <section class="doc-section">
        <h2>Log Object</h2>
        <p>The complete log object structure:</p>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Unique log identifier</span>
          </div>
          <div class="param-row">
            <code>timestamp</code>
            <span class="param-type">datetime</span>
            <span></span>
            <span>When the action occurred</span>
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
            <span>User who performed the action</span>
          </div>
          <div class="param-row">
            <code>name</code>
            <span class="param-type">string</span>
            <span></span>
            <span>User name (for offline actions)</span>
          </div>
          <div class="param-row">
            <code>item_id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Related item key (-1 if not applicable)</span>
          </div>
          <div class="param-row">
            <code>action</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Action type (see actions above)</span>
          </div>
          <div class="param-row">
            <code>before</code>
            <span class="param-type">object</span>
            <span></span>
            <span>State before the change (null for additions)</span>
          </div>
          <div class="param-row">
            <code>after</code>
            <span class="param-type">object</span>
            <span></span>
            <span>State after the change (null for deletions)</span>
          </div>
          <div class="param-row">
            <code>user</code>
            <span class="param-type">object</span>
            <span></span>
            <span>User object with name</span>
          </div>
        </div>
      </section>

      <!-- Before/After Examples -->
      <section class="doc-section">
        <h2>Before/After Data Examples</h2>
        <p>The <code class="inline-code">before</code> and <code class="inline-code">after</code> fields vary by action type:</p>

        <h3>add_column</h3>
        <div class="code-block">
          <pre><code>// before: null
// after:
{ "title": "New Column Name" }</code></pre>
        </div>

        <h3>edit_column</h3>
        <div class="code-block">
          <pre><code>// after (map of old name → new name):
{ "OldColumnName": "NewColumnName" }</code></pre>
        </div>

        <h3>delete_column</h3>
        <div class="code-block">
          <pre><code>// before:
{ "title": "Deleted Column Name" }
// after: null</code></pre>
        </div>

        <h3>add_row</h3>
        <div class="code-block">
          <pre><code>// before: null
// after (the new item):
{ "Name": "Product", "Price": "10.00", "Qty": "50" }</code></pre>
        </div>

        <h3>edit_row</h3>
        <div class="code-block">
          <pre><code>// before:
{
  "name": "Product Name",
  "item": { "Name": "Product", "Price": "10.00", "Qty": "50" }
}
// after:
{
  "item": { "Name": "Product", "Price": "15.00", "Qty": "50" }
}</code></pre>
        </div>

        <h3>delete_row</h3>
        <div class="code-block">
          <pre><code>// before (the deleted item):
{ "Name": "Product", "Price": "10.00", "Qty": "50" }
// after: null</code></pre>
        </div>

        <h3>receiving</h3>
        <div class="code-block">
          <pre><code>// before:
{
  "name": "Product Name",
  "cost": 5.00,
  "qty": 50
}
// after:
{
  "cost": 5.50,
  "qty": 100
}</code></pre>
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
  'get-logs': `curl -X GET "https://legitski.com/api/protected/log/1" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key"`
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

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    background: rgba(64, 158, 255, 0.15);
    color: #409EFF;
    padding: 4px 8px;
    border-radius: 4px;
    min-width: 100px;
  }

  span {
    color: rgba(255, 255, 255, 0.6);
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

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
