<template>
  <DocsLayout active-path="/docs">
    <div class="docs-page">
      <h1 class="page-title">Getting Started</h1>
      <p class="page-description">
        Welcome to the Legitski API documentation. This guide will help you integrate with our API to manage stores, inventory, transactions, and more.
      </p>

      <!-- Base URL Section -->
      <section class="doc-section">
        <h2>Base URL</h2>
        <p>All API requests should be made to:</p>
        <div class="code-block">
          <code>https://legitski.com/api/</code>
          <button class="copy-btn" @click="copyToClipboard('https://legitski.com/api/')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>
      </section>

      <!-- Authentication Section -->
      <section class="doc-section">
        <h2>Authentication</h2>
        <p>
          The Legitski API uses API keys for authentication. You can find your API key in the
          <strong>Settings</strong> page of your account.
        </p>
        <p>Include your API key in all requests using the <code class="inline-code">X-API-Key</code> header:</p>
        <div class="code-block">
          <pre><code>X-API-Key: your_api_key_here</code></pre>
          <button class="copy-btn" @click="copyToClipboard('X-API-Key: your_api_key_here')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <div class="info-box">
          <Icon name="mdi:information" class="info-icon" />
          <div>
            <strong>Keep your API key secure!</strong>
            <p>Never share your API key publicly or commit it to version control.</p>
          </div>
        </div>
      </section>

      <!-- Quick Example Section -->
      <section class="doc-section">
        <h2>Quick Example</h2>
        <p>Here's a simple example to fetch all your stores:</p>

        <div class="code-block">
          <pre><code>curl -X GET "https://legitski.com/api/protected/store/stores" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here"</code></pre>
          <button class="copy-btn" @click="copyCode('quickExample')">
            <Icon name="mdi:content-copy" />
          </button>
        </div>

        <p>Example response:</p>
        <div class="code-block">
          <pre><code>[
  {
    "id": 1,
    "name": "My Store",
    "code": "AbCMyS",
    "boss_id": 1,
    "tax": 0,
    "phone": "",
    "email": "",
    "workers": []
  }
]</code></pre>
        </div>
      </section>

      <!-- Response Format Section -->
      <section class="doc-section">
        <h2>Response Format</h2>
        <p>All responses are returned in JSON format. Successful responses return the requested data directly.</p>

        <h3>Error Responses</h3>
        <p>When an error occurs, the API returns an error object:</p>
        <div class="code-block">
          <pre><code>{
  "statusCode": 400,
  "statusMessage": "Error description here"
}</code></pre>
        </div>

        <h3>Common Status Codes</h3>
        <div class="status-table">
          <div class="status-row">
            <span class="status-code success">200</span>
            <span>Success</span>
          </div>
          <div class="status-row">
            <span class="status-code success">201</span>
            <span>Created successfully</span>
          </div>
          <div class="status-row">
            <span class="status-code error">400</span>
            <span>Bad request / Validation error</span>
          </div>
          <div class="status-row">
            <span class="status-code error">403</span>
            <span>Unauthenticated / Unauthorized</span>
          </div>
        </div>
      </section>

      <!-- Next Steps -->
      <section class="doc-section">
        <h2>Next Steps</h2>
        <p>Ready to start building? Check out the API endpoints:</p>
        <div class="next-links">
          <NuxtLink to="/docs/store/stores" class="next-link">
            <Icon name="mdi:store" />
            <div>
              <strong>Store API</strong>
              <span>Manage your stores</span>
            </div>
            <Icon name="mdi:arrow-right" class="arrow" />
          </NuxtLink>
        </div>
      </section>
    </div>
  </DocsLayout>
</template>

<script setup>
definePageMeta({
  middleware: ['language']
})

const codeSnippets = {
  quickExample: `curl -X GET "https://legitski.com/api/protected/store/stores" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here"`
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('Copied to clipboard!')
  } catch (err) {
    ElMessage.error('Failed to copy')
  }
}

const copyCode = (key) => {
  copyToClipboard(codeSnippets[key])
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
    font-size: 16px;
    font-weight: 600;
    margin: 20px 0 12px;
    color: rgba(255, 255, 255, 0.9);
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 12px;
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

.status-table {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);

  &:last-child {
    border-bottom: none;
  }
}

.status-code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;

  &.success {
    background: rgba(103, 194, 58, 0.15);
    color: #67C23A;
  }

  &.error {
    background: rgba(245, 108, 108, 0.15);
    color: #F56C6C;
  }
}

.next-links {
  margin-top: 16px;
}

.next-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(64, 158, 255, 0.3);
  }

  > .iconify {
    font-size: 24px;
    color: #409EFF;
  }

  div {
    flex: 1;

    strong {
      display: block;
      color: #fff;
      margin-bottom: 2px;
    }

    span {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .arrow {
    color: rgba(255, 255, 255, 0.3);
  }
}
</style>
