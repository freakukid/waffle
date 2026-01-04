<template>
  <div class="flex min-h-screen w-screen items-center justify-center overflow-y-auto py-12">
    <UiShootingStars />

    <div class="wrapper">
      <!-- Hero Section -->
      <div class="text-center mb-8">
        <h1 class="text-5xl font-bold mb-4">Legitski</h1>
        <p class="text-xl text-gray-300 mb-2">Modern Point of Sale & Inventory Management</p>
        <p class="text-lg text-gray-400">Inventory systems can be complex. Let's make it simple.</p>
      </div>

      <!-- Key Features Grid -->
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🏪</div>
          <h3>Multi-Store Management</h3>
          <p>Manage multiple locations from a single platform with individual store configurations and settings</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📦</div>
          <h3>Dynamic Inventory</h3>
          <p>Flexible column-based system with custom fields, Excel import/export, and real-time stock tracking</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">💳</div>
          <h3>Complete POS System</h3>
          <p>Full checkout experience with cash, card, and check payments plus automatic change calculation</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Advanced Analytics</h3>
          <p>Comprehensive reports with sales charts, profit tracking, and product performance metrics</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3>Worker Management</h3>
          <p>Role-based access control with customizable permissions for each team member</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🤝</div>
          <h3>Layaway System</h3>
          <p>Complete layaway management with invoice generation, PDF downloads, and email notifications</p>
        </div>
      </div>

      <!-- Extended Features List -->
      <div class="extended-features mt-8">
        <h2 class="text-2xl font-bold text-center mb-6">Everything You Need to Run Your Business</h2>

        <div class="features-columns">
          <div class="feature-column">
            <h4 class="feature-column-title">Sales & Transactions</h4>
            <ul class="feature-list">
              <li>Receipt printing (thermal printer support)</li>
              <li>Transaction history & search</li>
              <li>Individual item discounts</li>
              <li>Transaction-level discounts</li>
              <li>Automatic tax calculations</li>
              <li>Multiple payment methods</li>
            </ul>
          </div>

          <div class="feature-column">
            <h4 class="feature-column-title">Inventory Control</h4>
            <ul class="feature-list">
              <li>Inventory receiving & cost tracking</li>
              <li>Weighted average cost calculations</li>
              <li>Bulk operations & imports</li>
              <li>Complete audit trail & logs</li>
              <li>User activity tracking</li>
              <li>Custom column management</li>
            </ul>
          </div>

          <div class="feature-column">
            <h4 class="feature-column-title">Customer Management</h4>
            <ul class="feature-list">
              <li>Customer database with full contact info</li>
              <li>Layaway tracking & management</li>
              <li>Invoice PDF generation</li>
              <li>Email invoice delivery</li>
              <li>Customer search & filtering</li>
              <li>Purchase history tracking</li>
            </ul>
          </div>

          <div class="feature-column">
            <h4 class="feature-column-title">Business Intelligence</h4>
            <ul class="feature-list">
              <li>Daily, weekly, monthly, yearly charts</li>
              <li>Most sold & profitable items</li>
              <li>Payment method breakdown</li>
              <li>Product-specific analytics</li>
              <li>Profit & cost tracking</li>
              <li>Sales volume metrics</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Technical Highlights -->
      <div class="tech-highlights mt-8">
        <h3 class="text-xl font-bold text-center mb-4">Built for Reliability</h3>
        <div class="tech-badges">
          <span class="tech-badge">🌐 Offline Mode</span>
          <span class="tech-badge">🔄 Auto-Sync</span>
          <span class="tech-badge">🌍 Multi-Language</span>
          <span class="tech-badge">📱 Responsive Design</span>
          <span class="tech-badge">🔐 Secure Authentication</span>
          <span class="tech-badge">⚡ Real-Time Updates</span>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section mt-10">
        <el-button class="cta-button" type="primary" size="large" @click="navigateTo('/register')">
          Get Started Free
        </el-button>

        <el-button class="cta-button-secondary" size="large" @click="navigateTo('/login')">
          Sign In
        </el-button>

        <p class="text-center text-sm text-gray-400 mt-4">
          No credit card required • Start managing your inventory today
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>

<style lang="scss" scoped>
.wrapper {
  background: rgba(255, 255, 255, 0.02);
  max-width: 1200px;
  width: calc(100% - 32px);
  border-radius: 30px;
  padding: 48px 32px;
  position: relative;
  backdrop-filter: blur(10px);
  margin: 16px;
}

.logo {
  width: 96px;
  height: 96px;
  filter: drop-shadow(0 0 20px rgba(64, 158, 255, 0.5));
}

.gradient-text {
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(64, 158, 255, 0.4);
    transform: translateY(-4px);
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 12px 0 8px 0;
    color: #409EFF;
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    color: #b0b0b0;
    margin: 0;
  }
}

.feature-icon {
  font-size: 40px;
  line-height: 1;
}

.extended-features {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 32px 24px;

  h2 {
    color: #ffffff;
  }
}

.features-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-column {
  .feature-column-title {
    font-size: 16px;
    font-weight: 600;
    color: #67C23A;
    margin-bottom: 12px;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: 14px;
      color: #d0d0d0;
      padding: 6px 0;
      padding-left: 20px;
      position: relative;

      &:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #67C23A;
        font-weight: bold;
      }
    }
  }
}

.tech-highlights {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 24px;

  h3 {
    color: #ffffff;
  }
}

.tech-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.tech-badge {
  background: rgba(64, 158, 255, 0.15);
  border: 1px solid rgba(64, 158, 255, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #409EFF;
  font-weight: 500;
}

.cta-section {
  text-align: center;
}

.cta-button {
  min-width: 200px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 8px;
}

.cta-button-secondary {
  min-width: 200px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

@media (max-width: 768px) {
  .wrapper {
    padding: 32px 20px;
  }

  h1 {
    font-size: 2.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .features-columns {
    grid-template-columns: 1fr;
  }

  .cta-button,
  .cta-button-secondary {
    width: 100%;
    margin: 8px 0;
  }
}
</style>
