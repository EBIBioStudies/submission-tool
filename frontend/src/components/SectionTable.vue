<script setup>
import { ref } from 'vue';

const props = defineProps(['rows']);
const headerMap = new Map();
props.rows.forEach((row) =>
  row?.attributes?.forEach((attr) => {
    if (!headerMap.has(attr.name)) headerMap.set(attr.name, []);
    headerMap.get(attr.name).push(attr);
  }),
);
const keys = [...headerMap.keys()];
const headers = ref(keys);
const getCell = (row, col) => {
  return row.attributes.find(
    (att) => att.name.toLowerCase() === col.toLowerCase(),
  );
};
</script>
<template>
  <div class="ps-3">
    <table class="table table-responsive">
      <thead>
        <tr>
          <th v-for="(header, i) in headers" :key="i">
            <input
              class="form-control form-control-sm header"
              type="text"
              v-model="headers[i]"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td v-for="(col, j) in headers" :key="j">
            <input
              class="form-control form-control-sm"
              type="text"
              v-model="getCell(row, col).value"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.header {
  font-weight: bold;
  color: #8f8f8f;
}
</style>
