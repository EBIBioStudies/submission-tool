<script setup lang="ts">
import { computed, ComputedRef, reactive, watch } from 'vue';
import { sanitizeString, nonSafePathRegex, Replacement, doubleSpaceRegex } from '@/services/sanitize.utils.ts';

const props = defineProps<{
  replacements: [RegExp, Replacement][],
  allFiles: string[],
}>();

// Create a reactive copy so we can safely modify it
const entries = reactive(props.replacements);

const entriesWithResults = computed(() => entries.map((entry) => {
  const [regex, { replacement, examples, toString, added }] = entry;
  const example = examples[0];
  const result = sanitizeString(example, entries); // Might want to put just this entry here to visualize replacements one at a time

  // Extract filename from path if the path itself doesn't contain bad characters
  const getDisplayName = (path: string) => {
    const pathWithoutFilename = path.substring(0, path.lastIndexOf('/') + 1);
    const filename = path.substring(path.lastIndexOf('/') + 1);

    // If the path (excluding filename) has no bad characters, show only filename
    if (pathWithoutFilename === '' || !nonSafePathRegex.test(pathWithoutFilename)) {
      return filename;
    }
    return path;
  };

  return {
    title: toString || regex.source.replace(/\\(.)/g, '$1'),
    replacement,
    examples,
    added,
    example: getDisplayName(example),
    result: getDisplayName(result),
    hasInvalidReplacement: nonSafePathRegex.test(replacement),
  };
}));

let allFilesReplaced: ComputedRef<string[]>;
const nativeDoubleSpace = props.replacements.at(-1)![0].source === doubleSpaceRegex.source;
if (!nativeDoubleSpace) {
  const allFilesReplacedWithoutDbSpace = computed(() => props.allFiles.map(file => sanitizeString(file, entries.filter(([regex, ]) => regex !== doubleSpaceRegex))));
  const filesWithDoubleSpace = computed(() => allFilesReplacedWithoutDbSpace.value.filter(file => file.match(/\s{2,}/g)));

  watch(filesWithDoubleSpace, (examples) => {
    console.log(examples);
    if (examples.length > 0 && entries.at(-1)![0].source !== doubleSpaceRegex.source) {
      entries.push([doubleSpaceRegex, { replacement: ' ', examples, toString: '2 x " "', added: true }]);
    } else if (examples.length === 0 && entries.at(-1)![0].source === doubleSpaceRegex.source) {
      entries.pop();
    }
  })

  allFilesReplaced = computed(() => allFilesReplacedWithoutDbSpace.value.map(file => sanitizeString(file, entries.filter(([regex, ]) => regex === doubleSpaceRegex))));
} else {
  allFilesReplaced = computed(() => props.allFiles.map(file => sanitizeString(file, entries)));
}


const conflicts = computed(() => {
  const seen = new Map<string, number[]>();

  allFilesReplaced.value.forEach((file, index) => {
    if (!seen.has(file)) seen.set(file, []);
    seen.get(file)!.push(index);
  });

  return Array.from(seen.entries())
    .filter(([_, indexes]) => indexes.length > 1)
    .map(([file, indexes]) => ({ file, indexes }));
});


defineEmits<{
  close: [],
  save: [[RegExp, { replacement: string, examples: string[] }][]],
}>();

const impactedFileCount = computed(() => new Set(props.replacements.flatMap(([_, { examples }]) => examples)).size);

const hasInvalidReplacements = computed(() => entriesWithResults.value.some(entry => entry.hasInvalidReplacement) || conflicts.value.length > 0);


</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" style="z-index: 1060;">
    <div class="modal-backdrop fade show" style="z-index: 1055;"></div>
    <div class="modal-dialog" style="z-index: 1060;">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">Your folder contains {{ impactedFileCount }} file{{ impactedFileCount === 1 ? '' : 's' }} with unsupported characters</h5>
        </div>

        <div class="modal-body">
          <p>
            You won't be able to use those files in any submission unless we replace the problematic characters with
            supported ones.
          </p>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
              <tr>
                <th class="text-end">Problematic character</th>
                <th>Replacement</th>
                <th>Example</th>
                <th></th>
                <th>Result</th>
              </tr>
              </thead>
              <tbody class="font-monospace">
              <tr v-for="({title, example, examples, result, hasInvalidReplacement, added}, index) in entriesWithResults"
                  :key="index" :class="{'added': added}">
                <td class="preserve-whitespace text-end">{{ title }}</td>
                <td>
                  <input
                    type="text"
                    v-model="entries[index][1].replacement"
                    :class="{'is-invalid': hasInvalidReplacement}"
                    class="form-control"
                  >
                  <div v-if="hasInvalidReplacement" class="invalid-feedback d-block">
                    Replacement contains invalid characters
                  </div>
                </td>
                <td class="preserve-whitespace">"<span v-html="example"></span>" <span
                  v-if="examples.length > 1">, ...</span></td>
                <td>⇒</td>
                <td class="preserve-whitespace">"<span v-html="result"></span>" <span
                  v-if="examples.length > 1">, ...</span></td>
              </tr>
              </tbody>
            </table>
          </div>

          <span v-if="conflicts.length > 0" class="text-danger">
            <b>{{ conflicts.length }} conflict{{ conflicts.length === 1 ? '' : 's' }} detected</b>: some files would have the same name with current rules:
          </span>

          <div v-if="conflicts.length > 0" class="table-responsive">
            <table class="table">
              <thead>
              <tr>
                <th class="text-danger">Original File Name</th>
                <th class="text-danger">Created conflict</th>
              </tr>
              </thead>
              <tbody v-for="({file, indexes}, i) in conflicts" :key="file" :class="{'table-danger': i % 2 === 0}" class="font-monospace">
              <tr v-for="(index, i) in indexes" :key="index">
                <td>{{ allFiles[index] }}</td>
                <td v-if="i === 0" :rowspan="indexes.length">{{ file }}</td>
              </tr>
              </tbody>
            </table>
          </div>



          <p class="text-warning">
            This file renaming won't impact your local files, but only the uploaded ones.<br>
            Be sure to reflect those name changes in your submission and to regenerate your file lists to use the proper
            names.
          </p>

        </div>

        <div class="modal-footer">

          <button class="btn btn-secondary" @click="$emit('close')">
            Cancel
          </button>

          <button class="btn btn-primary" @click="$emit('save', entries)" :disabled="hasInvalidReplacements">
            Upload renamed files
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  --bs-modal-width: 50vw;
}

.preserve-whitespace {
  white-space: pre;
}

input {
  width: 6em;
}

td {
  align-content: center;
}
.added td {
  color: #1b5c9c;
}
</style>
