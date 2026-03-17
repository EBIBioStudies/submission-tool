<script setup lang="ts" generic="T">

/**
 * Allow to define a variable within a template to avoid code repetition and recalculating things
 *
 * Usage:
 * <Let :value="...heavyCalculation" v-slot="{ value: nameOfTheVariable }"
 */
defineProps<{
  /**
   * The value to put inside the variable
   */
  value: T
}>();

defineSlots<{
  default(props: { value: T }): any
}>();
</script>

<template>
  <slot :value="value" />
</template>
