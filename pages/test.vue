<template>



  <div style="height: calc(100vh - 215px);width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
    

    <el-button @click="printReceipt()">Print</el-button>
  </div>


  



  <div id="receipt-settings-wrapper">
    <div class="receipt-super-title">Settings</div>
    <div class="receipt-scroll-wrapper">
        <div id="printer-address-wrapper">
            <div class="receipt-settings-title">Network Connection</div>
            <label for="printer-address">Printer address: </label>
            <input class="printer-address" />
        </div>

        <div id="header-input-wrapper">
            <div class="receipt-settings-title">Receipt Header</div>
            <div id="header-container" class="line-container">
                <div class="header-item receipt-input-wrapper" data-number="1" data-type="header">
                    <div class="delete-line-item">x</div>
                    <div class="receipt-input-container">
                        <label for="font-size-input">Font Size</label>
                        <select class="font-size-input">
                            <option value="1">12</option>
                            <option value="2">24</option>
                            <option value="3">36</option>
                            <option value="4">48</option>
                            <option value="5">60</option>
                            <option value="6">72</option>
                            <option value="7">84</option>
                            <option value="8">96</option>
                        </select>
                    </div>
                    <div class="receipt-input-container">
                        <label for="font-alignment-input">Font Alignment</label>
                        <select class="font-alignment-input">
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                    <div class="receipt-input-container">
                        <label class="receipt-text-label" for="receipt-text-input">Text (Line 1)</label>
                        <input class="receipt-text-input" />
                    </div>
                </div>
            </div>
            <div id="add-header-button">Add</div>
        </div>

        <div id="footer-input-wrapper">
            <div class="receipt-settings-title">Receipt Footer</div>
            <div id="footer-container" class="line-container">
              <div class="footer-item receipt-input-wrapper" data-number="1" data-type="footer">
                  <div class="delete-line-item">x</div>
                  <div class="receipt-input-container">
                      <label for="font-size-input">Font Size</label>
                      <select class="font-size-input">
                          <option value="1">12</option>
                          <option value="2">24</option>
                          <option value="3">36</option>
                          <option value="4">48</option>
                          <option value="5">60</option>
                          <option value="6">72</option>
                          <option value="7">84</option>
                          <option value="8">96</option>
                      </select>
                  </div>
                  <div class="receipt-input-container">
                      <label for="font-alignment-input">Font Alignment</label>
                      <select class="font-alignment-input">
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                      </select>
                  </div>
                  <div class="receipt-input-container">
                      <label class="receipt-text-label" for="receipt-text-input">Text (Line 1)</label>
                      <input class="receipt-text-input" />
                  </div>
              </div>
            </div>
            <div id="add-footer-button">Add</div>
        </div>
    </div>

    <div id="save-receipt-settings-wrapper">
        <div id="receipt-settings-result"></div>
        <button id="save-receipt-settings" class="add">Save Settings</button>
    </div>
</div>
<div id="receipt-preview-wrapper">
    <div class="receipt-super-title">Preview</div>

    <div id="receipt-container">
        <div id="receipt-header-wrapper">
            <!-- {{#each header.lines}}
                <div class="receipt-line font-{{size}} align-{{align}}" data-receipt_id="{{inc @index}}">{{text}}</div>
            {{else}}
                <div class="receipt-line font-1 align-left" data-receipt_id="1"></div>
            {{/each}} -->
        </div>

        <!-- <div id="receipt-item-wrapper" class="font-1">
            <div class="receipt-item">
                <span class="transaction-item">{{lookup example_item link_columns.name}}</span>
                <span>{{currencyMath 400 '-' (currencyMath 2 '*' (lookup example_item link_columns.price))}}</span>
            </div>

            <div class="receipt-item-details">
                <span class="transaction-quantity">(2 @ {{currencyMath 100 '-' (lookup example_item link_columns.price)}} ea)</span>
                <span>Discount 2.00-  &emsp;&emsp;</span>
            </div>
        </div>

        <br />
        <br />

        <div id="receipt-total-wrapper" class="font-1">
            <div>
                <span class="total-label">Subtotal</span>
                <span>{{currencyMath 400 '-' (currencyMath 2 '*' (lookup example_item link_columns.price))}}</span>
            </div>

            <div>
                <span class="total-label">Tax (8.300%)</span>
                <span>{{currencyMath 0.083 '*' (currencyMath 400 '-' (currencyMath 2 '*' (lookup example_item link_columns.price))) 'true'}}</span>
            </div>

            <div class="font-2">
                <span class="total-label">Total</span>
                <span>{{currencyMath (currencyMath 400 '-' (currencyMath 2 '*' (lookup example_item link_columns.price))) '+' (currencyMath 0.083 '*' (currencyMath 400 '-' (currencyMath 2 '*' (lookup example_item link_columns.price))) 'true') 'false' 'true'}}</span>
            </div>

        </div> -->

        <div id="receipt-footer-wrapper">
            <!-- {{#each footer.lines}}
                <div class="receipt-line font-{{size}} align-{{align}}" data-receipt_id="{{inc @index}}">{{text}}</div>
            {{else}}
                <div class="receipt-line font-1 align-left" data-receipt_id="1"></div>
            {{/each}} -->
        </div>
    </div>
</div>

</template>

<script setup>
//Import
const pinia = useStore()
const { formatDate } = useFormatter()

//Data
const storeId = computed(() => pinia.store)

async function printReceipt() {
  const response = await useFetchApi(`/api/protected/transaction/print`, {
    method: "POST",
    body: {
    }
  })
}
</script>

<style scoped>
/* RECEIPT */
#receipt-wrapper.active-tab {
    display: flex !important;
    justify-content: space-around;
    height: 100%;
}

#receipt-preview-wrapper, #receipt-settings-wrapper {
    min-width: 200px;
    margin-bottom: 15px;
}

#receipt-settings-wrapper {
    border: 1px solid #4a4a4b;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 462px;
    height: calc(100% - 70px);
}

.receipt-scroll-wrapper {
    overflow-y: auto;
}

.receipt-super-title{
    font-size: 25px;
    margin: 5px 0;
    text-align: center;
}

#printer-address-wrapper {
    text-align: center
}

.printer-address {
    width: 30px;
    text-align: center;
    height: 25px;
}

.period {
    margin-left: 4px;
    font-size: 20px;
    line-height: 15px;
}

.receipt-settings-title {
    font-size: 20px;
    margin: 6px 0;
    text-align: left;
}

.receipt-input-container:not(:last-child) {
    padding-right: 25px;
}

.receipt-input-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid #353535;
    padding: 13px;
    position: relative;
    white-space: nowrap;
}

#add-header-button, #add-footer-button {
    background: green;
    width: 80px;
    border-radius: 1px;
    text-align: center;
    padding: 5px 5px;
    cursor: pointer;
    margin: 10px auto;
}

#add-header-button:hover, #add-footer-button:hover {
    filter: brightness(115%);
}

.receipt-text-input {
    height: 29px;
    width: 200px;
}

.delete-line-item {
    position: absolute;
    right: 0;
    top: 0;
    padding: 3px 10px;
    cursor: pointer;
    font-weight: bold;
    color: #fc7e7e;
}

.delete-line-item:hover {
    color: #ff4a4a;
}

#save-receipt-settings-wrapper {
    position: relative;
    margin-top: auto;
    width: 100%;
    text-align: center;
    padding: 11px 0 5px;
    border-top: 1px solid #3e3e3f;
}

#receipt-container {
    overflow-y: auto;
    font-family: 'VT323', Arial, Helvetica, sans-serif, Georgia, serif;
    width: 462px;
    height: calc(100% - 133px);
    margin: 0 auto;
    background: #e5e5e5;
    color: #000;
    padding: 20px 10px 20px 10px;
    word-break: break-all;
    display: flex;
    flex-direction: column;
}

#receipt-footer-wrapper {
    margin-top: auto;
}

.font-1 {
    font-size: 24px;
}

.font-2 {
    font-size: 48px;
}

.font-3 {
    font-size: 72px;
}

.font-4 {
    font-size: 96px;
}

.font-5 {
    font-size: 120px;
}

.font-6 {
    font-size: 144px;
}

.font-7 {
    font-size: 168px;
}

.font-8 {
    font-size: 192px;
}

.align-left {
    text-align: left;
}

.align-center {
    text-align: center;
}

.align-right {
    text-align: right;
}

.receipt-item, .receipt-item-details, #receipt-total-wrapper div {
    display: flex;
}

.transaction-item, .transaction-quantity, .total-label {
    margin-right: auto;
}

#receipt-settings-result {
    font-size: 12px;
    margin-bottom: 10px;
    color: #4df14d;
}
/* RECEIPT */
</style>