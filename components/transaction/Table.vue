<template>
  <el-table-column label="Items Sold">
    <el-table-column label="Qty">
      <template #default="scope">
        <div v-for="item in scope.row.items" :key="item" class="center">{{item.qty}}</div>
      </template>
    </el-table-column>
    <el-table-column label="Name">
      <template #default="scope">
        <div v-for="item in scope.row.items" :key="item" class="one-line">{{item.name}}</div>
      </template>
    </el-table-column>
    <el-table-column label="Price">
      <template #default="scope">
        <div v-for="item in scope.row.items" :key="item" class="center">
          <div v-if="item.discount == 0">{{item.price}}</div>
          <div v-else>{{item.new_price}}</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="Discount (Base Price) | Percent">
      <template #default="scope">
        <div v-for="item in scope.row.items" :key="item">
          <div v-if="item.discount == 0">&nbsp;</div>
          <div v-else class="one-line">({{item.price}}) | {{item.discount}}%</div>
        </div>
      </template>
    </el-table-column>
  </el-table-column>
</template>

<script setup></script>