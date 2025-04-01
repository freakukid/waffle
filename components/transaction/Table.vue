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
          <span :class="{'line-through': item.discount > 0}">{{item.price}}</span>
          <span v-if="item.discount > 0">&nbsp;{{item.new_price}}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column :label="$t('label.Discount')">
      <template #default="scope">
        <div v-for="item in scope.row.items" :key="item">
          <div v-if="item.discount > 0" class="text-center">
            <span v-if="item.discount_type === 'percent'">{{item.discount}}%</span>
            <span v-else-if="item.discount_type === 'amount'">-${{item.discount}}</span>
          </div>
        </div>
      </template>
    </el-table-column>
  </el-table-column>
</template>

<script setup>

</script>