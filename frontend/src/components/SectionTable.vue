<script setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';

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
const theseRows = ref(props.rows);
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
        <draggable
          v-model="headers"
          tag="tr"
          :item-key="(key) => key"
          @start="dragging = true"
          @end="dragging = false"
        >
          <template #item="{ element: header }">
            <th>
              {{ header }}
            </th>
          </template>
        </draggable>
      </thead>
      <draggable v-model="theseRows" tag="tbody" item-key="name">
        <template #item="{ element: row }">
          <tr>
            <td v-for="(col, j) in headers" :key="j">
              <input
                class="form-control form-control-sm"
                type="text"
                v-model="getCell(row, col).value"
              />
            </td>
          </tr>
        </template>
      </draggable>
    </table>
  </div>
</template>

<style scoped>
.header {
  font-weight: bold;
  color: #8f8f8f;
}
</style>
