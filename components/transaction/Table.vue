<template>
  <el-table-column :label="$t('label.Items Sold')">
    <el-table-column :label="$t('label.Qty')">
      <template #default="scope">
        <div v-for="item in scope.row.items" :key="item" class="text-center">{{item.qty}}</div>
      </template>
    </el-table-column>
    <el-table-column :label="$t('label.Name')">
      <template #default="scope">
        <div v-for="item in scope.row.items" :key="item" class="truncate">{{item.name}}</div>
      </template>
    </el-table-column>
    <el-table-column :label="$t('label.Price')">
      <template #default="scope">
        <div v-for="item in scope.row.items" :key="item" class="text-center">
          <div v-if="item.discount === 0">{{item.price}}</div>
          <div v-else-if="item.discount > 0 && item.new_price">{{item.new_price}}</div>
          <div v-else>{{calcDiscountedItemPrice(item.price, item.discount)}}</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column :label="$t('label.Discount (Base Price) | Percent')">
      <template #default="scope">
        <div v-for="item in scope.row.items" :key="item">
          <div v-if="item.discount == 0">&nbsp;</div>
          <div v-else class="truncate">({{item.price}}) | {{item.discount}}%</div>
        </div>
      </template>
    </el-table-column>
  </el-table-column>
</template>

<script setup>
const { calcDiscountedItemPrice } = useCalculations()
</script>