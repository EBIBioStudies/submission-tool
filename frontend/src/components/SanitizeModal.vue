<script setup lang="ts">
import { computed, reactive } from 'vue';
import { sanitizeString, nonSafePathRegex, Replacement } from '@/services/sanitize.utils.ts';

const props = defineProps<{ replacements: [RegExp, Replacement][] }>();

// Create a reactive copy so we can safely modify it
const entries = reactive(props.replacements);

const DEFAULT_MULTI_SPACE_EXAMPLE = '<i>example  multi  space.txt</i>';

const entriesWithResults = computed(() => entries.map(([regex, { replacement, examples, toString }]) => {
  const example = examples[0] || DEFAULT_MULTI_SPACE_EXAMPLE ;
  const result = sanitizeString(example, entries);

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
    example: getDisplayName(example),
    result: getDisplayName(result),
    hasInvalidReplacement: nonSafePathRegex.test(replacement),
  };
}));


defineEmits<{
  close: [],
  save: [[RegExp, { replacement: string, examples: string[] }][]],
}>();

const impactedFileCount = computed(() => new Set(props.replacements.flatMap(([_, { examples }]) => examples)).size);

const hasInvalidReplacements = computed(() => entriesWithResults.value.some(entry => entry.hasInvalidReplacement));


</script>

<template>
  <div class="modal fade show d-block">
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">Your folder contains {{ impactedFileCount }} files with unsupported characters</h5>
        </div>

        <div class="modal-body">
          <p>
            You won't be able to use those files in any submission unless we replace the problematic characters with
            supported ones.
          </p>

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
            <tbody>
            <tr v-for="({title, example, examples, result, hasInvalidReplacement}, index) in entriesWithResults"
                :key="index">
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
              <td class="preserve-whitespace">"<span v-html="example"></span>" <span v-if="examples.length > 1">, ...</span></td>
              <td>⇒</td>
              <td class="preserve-whitespace">"<span v-html="result"></span>" <span v-if="examples.length > 1">, ...</span></td>
            </tr>
            </tbody>
          </table>
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
</style>
