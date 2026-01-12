<template>
  <DocsLayout active-path="/docs/inventory">
    <div class="docs-page">
      <h1 class="page-title">Inventory API</h1>
      <p class="page-description">
        Manage your store's inventory with these endpoints. Add, edit, delete items and columns, import data, and track receiving.
      </p>

      <!-- Endpoints Overview -->
      <section class="doc-section">
        <h2>Endpoints</h2>
        <div class="endpoints-table">
          <div class="endpoint-row" @click="scrollTo('get-inventory')">
            <span class="method get">GET</span>
            <code>/api/protected/inventory/[store_id]</code>
            <span class="desc">Get inventory</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('add-row')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/add-row</code>
            <span class="desc">Add item</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('edit-row')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/edit-row</code>
            <span class="desc">Edit item</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('delete-row')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/delete-row</code>
            <span class="desc">Delete item</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('add-column')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/add-column</code>
            <span class="desc">Add column</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('edit-column')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/edit-column</code>
            <span class="desc">Edit columns</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('delete-column')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/delete-column</code>
            <span class="desc">Delete column</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('sort-columns')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/sort-columns</code>
            <span class="desc">Sort columns</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('receiving')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/receiving</code>
            <span class="desc">Receive stock</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('import')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/import</code>
            <span class="desc">Import inventory</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('register-columns')">
            <span class="method post">POST</span>
            <code>/api/protected/inventory/register-columns</code>
            <span class="desc">Register columns</span>
          </div>
          <div class="endpoint-row" @click="scrollTo('drop-table')">
            <span class="method post delete">POST</span>
            <code>/api/protected/inventory/drop-table</code>
            <span class="desc">Clear inventory</span>
          </div>
        </div>
      </section>

      <!-- Permissions Note -->
      <section class="doc-section">
        <div class="info-box">
          <Icon name="mdi:shield-account" class="info-icon" />
          <div>
            <strong>Worker Permissions</strong>
            <p>Workers have granular permissions for inventory operations. Owners have full access. See the permissions table at the bottom.</p>
          </div>
        </div>
      </section>

      <!-- GET /inventory/[store_id] -->
      <section id="get-inventory" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method get">GET</span>
          <h2>/api/protected/inventory/[store_id]</h2>
        </div>
        <p>Retrieve inventory data for a store.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> (owner) or <code class="inline-code">Worker</code> role.</p>

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
          <pre><code>curl -X GET "https://legitski.com/api/protected/inventory/1" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key"</code></pre>
          <button class="copy-btn" @click="copyCode('get-inventory')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "id": 1,
  "store_id": 1,
  "unique_key": 5,
  "version": 0,
  "stock": {
    "0": { "Name": "Product A", "Price": "10.00", "Qty": "100" },
    "1": { "Name": "Product B", "Price": "25.00", "Qty": "50" }
  },
  "columns": ["Name", "Price", "Qty"],
  "name_column": "Name",
  "price_column": "Price",
  "quantity_column": "Qty",
  "discount_column": "",
  "cost_column": ""
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/add-row -->
      <section id="add-row" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/add-row</h2>
        </div>
        <p>Add a new item to the inventory.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">add_item</code> permission.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>item</code>
            <span class="param-type">object</span>
            <span class="param-required">required</span>
            <span>Item data with column values</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/add-row" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "item": {
      "Name": "New Product",
      "Price": "15.99",
      "Qty": "25"
    }
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('add-row')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Item Added!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/edit-row -->
      <section id="edit-row" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/edit-row</h2>
        </div>
        <p>Update an existing item in the inventory.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">edit_item</code> permission.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>key</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Unique key of the item</span>
          </div>
          <div class="param-row">
            <code>item</code>
            <span class="param-type">object</span>
            <span class="param-required">required</span>
            <span>Updated item data</span>
          </div>
          <div class="param-row">
            <code>prev_item</code>
            <span class="param-type">object</span>
            <span class="param-required">required</span>
            <span>Previous item state (for logging)</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/edit-row" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "key": "0",
    "item": { "Name": "Updated Product", "Price": "19.99", "Qty": "30" },
    "prev_item": { "Name": "Product A", "Price": "10.00", "Qty": "100" }
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('edit-row')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Item Updated!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/delete-row -->
      <section id="delete-row" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/delete-row</h2>
        </div>
        <p>Delete an item from the inventory.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">delete_item</code> permission.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>key</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Unique key of the item</span>
          </div>
          <div class="param-row">
            <code>item</code>
            <span class="param-type">object</span>
            <span class="param-required">required</span>
            <span>Item being deleted (for logging)</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/delete-row" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "key": "0",
    "item": { "Name": "Product A", "Price": "10.00", "Qty": "100" }
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('delete-row')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Item Deleted!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/add-column -->
      <section id="add-column" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/add-column</h2>
        </div>
        <p>Add a new column to the inventory.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role only.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>column_name</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Name of the new column</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/add-column" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "column_name": "SKU"
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('add-column')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Column Added!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/edit-column -->
      <section id="edit-column" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/edit-column</h2>
        </div>
        <p>Rename columns and update column mappings.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role only.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>column_map</code>
            <span class="param-type">object</span>
            <span class="param-required">required</span>
            <span>Map of old names to new names</span>
          </div>
          <div class="param-row">
            <code>name_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Column for item names</span>
          </div>
          <div class="param-row">
            <code>price_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Column for prices</span>
          </div>
          <div class="param-row">
            <code>quantity_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Column for quantities</span>
          </div>
          <div class="param-row">
            <code>discount_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Column for discounts</span>
          </div>
          <div class="param-row">
            <code>cost_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Column for costs</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/edit-column" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "column_map": { "Qty": "Quantity" },
    "name_column": "Name",
    "price_column": "Price",
    "quantity_column": "Quantity",
    "discount_column": "",
    "cost_column": ""
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('edit-column')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Column Updated!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/delete-column -->
      <section id="delete-column" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/delete-column</h2>
        </div>
        <p>Delete a column from the inventory.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role only.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>column_name</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Column to delete</span>
          </div>
          <div class="param-row">
            <code>name_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Updated name column mapping</span>
          </div>
          <div class="param-row">
            <code>price_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Updated price column mapping</span>
          </div>
          <div class="param-row">
            <code>quantity_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Updated quantity column mapping</span>
          </div>
          <div class="param-row">
            <code>discount_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Updated discount column mapping</span>
          </div>
          <div class="param-row">
            <code>cost_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Updated cost column mapping</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/delete-column" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "column_name": "SKU",
    "name_column": "Name",
    "price_column": "Price",
    "quantity_column": "Qty",
    "discount_column": "",
    "cost_column": ""
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('delete-column')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Column Deleted!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/sort-columns -->
      <section id="sort-columns" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/sort-columns</h2>
        </div>
        <p>Reorder the columns in the inventory.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role only.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>columns</code>
            <span class="param-type">array</span>
            <span class="param-required">required</span>
            <span>Reordered array of column names</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/sort-columns" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "columns": ["Name", "Qty", "Price"]
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('sort-columns')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Columns Sorted!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/receiving -->
      <section id="receiving" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/receiving</h2>
        </div>
        <p>Record received stock and update average cost.</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> or <code class="inline-code">Worker</code> with <code class="inline-code">receiving</code> permission.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>key</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Item unique key</span>
          </div>
          <div class="param-row">
            <code>qty</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>Quantity received</span>
          </div>
          <div class="param-row">
            <code>total_cost</code>
            <span class="param-type">number</span>
            <span class="param-required">required</span>
            <span>Total cost of received items</span>
          </div>
          <div class="param-row">
            <code>prev_cost</code>
            <span class="param-type">number</span>
            <span class="param-required">required</span>
            <span>Previous average cost</span>
          </div>
          <div class="param-row">
            <code>cost_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Name of cost column</span>
          </div>
          <div class="param-row">
            <code>quantity_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Name of quantity column</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/receiving" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "key": "0",
    "qty": 50,
    "total_cost": 250.00,
    "prev_cost": 5.00,
    "cost_column": "Cost",
    "quantity_column": "Qty"
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('receiving')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Item Received!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/import -->
      <section id="import" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/import</h2>
        </div>
        <p>Import inventory data (create or replace).</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role only.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>stock</code>
            <span class="param-type">object</span>
            <span class="param-required">required</span>
            <span>Complete stock data</span>
          </div>
          <div class="param-row">
            <code>columns</code>
            <span class="param-type">array</span>
            <span class="param-required">required</span>
            <span>Array of column names</span>
          </div>
          <div class="param-row">
            <code>unique_key</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>Next unique key value</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/import" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "stock": {
      "0": { "Name": "Item 1", "Price": "10.00" },
      "1": { "Name": "Item 2", "Price": "20.00" }
    },
    "columns": ["Name", "Price"],
    "unique_key": 2
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('import')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Inventory Created!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/register-columns -->
      <section id="register-columns" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post">POST</span>
          <h2>/api/protected/inventory/register-columns</h2>
        </div>
        <p>Link columns to their roles (name, price, quantity, etc.).</p>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role only.</p>

        <h3>Request Body</h3>
        <div class="params-table">
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span class="param-required">required</span>
            <span>The store ID</span>
          </div>
          <div class="param-row">
            <code>stock</code>
            <span class="param-type">object</span>
            <span class="param-required">required</span>
            <span>The stock data</span>
          </div>
          <div class="param-row">
            <code>name_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Column for item names</span>
          </div>
          <div class="param-row">
            <code>price_column</code>
            <span class="param-type">string</span>
            <span class="param-required">required</span>
            <span>Column for prices</span>
          </div>
          <div class="param-row">
            <code>quantity_column</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Column for quantities</span>
          </div>
          <div class="param-row">
            <code>discount_column</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Column for discounts</span>
          </div>
          <div class="param-row">
            <code>cost_column</code>
            <span class="param-type">string</span>
            <span class="param-optional">optional</span>
            <span>Column for costs</span>
          </div>
        </div>

        <h3>Request</h3>
        <div class="code-block">
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/register-columns" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "store_id": 1,
    "stock": { ... },
    "name_column": "Product Name",
    "price_column": "Retail Price",
    "quantity_column": "Stock"
  }'</code></pre>
          <button class="copy-btn" @click="copyCode('register-columns')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Columns Linked!"
}</code></pre>
        </div>
      </section>

      <!-- POST /inventory/drop-table -->
      <section id="drop-table" class="doc-section endpoint-section">
        <div class="endpoint-header">
          <span class="method post delete">POST</span>
          <h2>/api/protected/inventory/drop-table</h2>
        </div>
        <p>Clear all inventory data for a store.</p>

        <div class="warning-box">
          <Icon name="mdi:alert" class="warning-icon" />
          <div>
            <strong>Warning: Destructive Action</strong>
            <p>This will permanently delete all inventory items, columns, logs, transactions, and layaways for this store. This cannot be undone.</p>
          </div>
        </div>

        <h3>Authorization</h3>
        <p>Requires <code class="inline-code">Boss</code> role only.</p>

        <h3>Request Body</h3>
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
          <pre><code>curl -X POST "https://legitski.com/api/protected/inventory/drop-table" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"store_id": 1}'</code></pre>
          <button class="copy-btn" @click="copyCode('drop-table')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <h3>Response</h3>
        <div class="code-block">
          <pre><code>{
  "inventory": { ... },
  "message": "Inventory Deleted!"
}</code></pre>
        </div>
      </section>

      <!-- Permissions Table -->
      <section class="doc-section">
        <h2>Worker Permissions</h2>
        <p>Workers have granular permissions for inventory operations:</p>
        <div class="permissions-table">
          <div class="perm-header">
            <span>Operation</span>
            <span>Owner</span>
            <span>Worker</span>
            <span>Permission Required</span>
          </div>
          <div class="perm-row">
            <span>Get Inventory</span>
            <span class="check">✓</span>
            <span class="check">✓</span>
            <span>-</span>
          </div>
          <div class="perm-row">
            <span>Add Item</span>
            <span class="check">✓</span>
            <span class="check">✓</span>
            <span><code>add_item</code></span>
          </div>
          <div class="perm-row">
            <span>Edit Item</span>
            <span class="check">✓</span>
            <span class="check">✓</span>
            <span><code>edit_item</code></span>
          </div>
          <div class="perm-row">
            <span>Delete Item</span>
            <span class="check">✓</span>
            <span class="check">✓</span>
            <span><code>delete_item</code></span>
          </div>
          <div class="perm-row">
            <span>Receiving</span>
            <span class="check">✓</span>
            <span class="check">✓</span>
            <span><code>receiving</code></span>
          </div>
          <div class="perm-row">
            <span>Add/Edit/Delete Column</span>
            <span class="check">✓</span>
            <span class="cross">✗</span>
            <span>-</span>
          </div>
          <div class="perm-row">
            <span>Import / Drop Table</span>
            <span class="check">✓</span>
            <span class="cross">✗</span>
            <span>-</span>
          </div>
        </div>
      </section>

      <!-- Inventory Object -->
      <section class="doc-section">
        <h2>Inventory Object</h2>
        <p>The complete inventory object structure:</p>
        <div class="params-table">
          <div class="param-row">
            <code>id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Unique inventory identifier</span>
          </div>
          <div class="param-row">
            <code>store_id</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Associated store ID</span>
          </div>
          <div class="param-row">
            <code>unique_key</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Counter for next item key</span>
          </div>
          <div class="param-row">
            <code>version</code>
            <span class="param-type">integer</span>
            <span></span>
            <span>Inventory version number</span>
          </div>
          <div class="param-row">
            <code>stock</code>
            <span class="param-type">object</span>
            <span></span>
            <span>Object containing all items keyed by unique_key</span>
          </div>
          <div class="param-row">
            <code>columns</code>
            <span class="param-type">array</span>
            <span></span>
            <span>Ordered list of column names</span>
          </div>
          <div class="param-row">
            <code>name_column</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Column used for item names</span>
          </div>
          <div class="param-row">
            <code>price_column</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Column used for prices</span>
          </div>
          <div class="param-row">
            <code>quantity_column</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Column used for quantities</span>
          </div>
          <div class="param-row">
            <code>discount_column</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Column used for discounts</span>
          </div>
          <div class="param-row">
            <code>cost_column</code>
            <span class="param-type">string</span>
            <span></span>
            <span>Column used for costs</span>
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
  'get-inventory': `curl -X GET "https://legitski.com/api/protected/inventory/1" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key"`,
  'add-row': `curl -X POST "https://legitski.com/api/protected/inventory/add-row" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "item": {
      "Name": "New Product",
      "Price": "15.99",
      "Qty": "25"
    }
  }'`,
  'edit-row': `curl -X POST "https://legitski.com/api/protected/inventory/edit-row" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "key": "0",
    "item": { "Name": "Updated Product", "Price": "19.99", "Qty": "30" },
    "prev_item": { "Name": "Product A", "Price": "10.00", "Qty": "100" }
  }'`,
  'delete-row': `curl -X POST "https://legitski.com/api/protected/inventory/delete-row" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "key": "0",
    "item": { "Name": "Product A", "Price": "10.00", "Qty": "100" }
  }'`,
  'add-column': `curl -X POST "https://legitski.com/api/protected/inventory/add-column" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "column_name": "SKU"
  }'`,
  'edit-column': `curl -X POST "https://legitski.com/api/protected/inventory/edit-column" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "column_map": { "Qty": "Quantity" },
    "name_column": "Name",
    "price_column": "Price",
    "quantity_column": "Quantity",
    "discount_column": "",
    "cost_column": ""
  }'`,
  'delete-column': `curl -X POST "https://legitski.com/api/protected/inventory/delete-column" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "column_name": "SKU",
    "name_column": "Name",
    "price_column": "Price",
    "quantity_column": "Qty",
    "discount_column": "",
    "cost_column": ""
  }'`,
  'sort-columns': `curl -X POST "https://legitski.com/api/protected/inventory/sort-columns" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "columns": ["Name", "Qty", "Price"]
  }'`,
  'receiving': `curl -X POST "https://legitski.com/api/protected/inventory/receiving" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "key": "0",
    "qty": 50,
    "total_cost": 250.00,
    "prev_cost": 5.00,
    "cost_column": "Cost",
    "quantity_column": "Qty"
  }'`,
  'import': `curl -X POST "https://legitski.com/api/protected/inventory/import" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "stock": {
      "0": { "Name": "Item 1", "Price": "10.00" },
      "1": { "Name": "Item 2", "Price": "20.00" }
    },
    "columns": ["Name", "Price"],
    "unique_key": 2
  }'`,
  'register-columns': `curl -X POST "https://legitski.com/api/protected/inventory/register-columns" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{
    "store_id": 1,
    "stock": { ... },
    "name_column": "Product Name",
    "price_column": "Retail Price",
    "quantity_column": "Stock"
  }'`,
  'drop-table': `curl -X POST "https://legitski.com/api/protected/inventory/drop-table" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key" \\
  -d '{"store_id": 1}'`
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
  }
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

.permissions-table {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.perm-header {
  display: grid;
  grid-template-columns: 1fr 80px 80px 160px;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

.perm-row {
  display: grid;
  grid-template-columns: 1fr 80px 80px 160px;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);

  &:last-child {
    border-bottom: none;
  }

  code {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 11px;
    background: rgba(64, 158, 255, 0.15);
    color: #409EFF;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .check {
    color: #67C23A;
    font-weight: 600;
  }

  .cross {
    color: #F56C6C;
    font-weight: 600;
  }
}
</style>
