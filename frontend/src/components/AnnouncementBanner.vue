<template>
    <div 
      v-if="announcement.enabled && !isDismissed" 
      :class="[
        'announcement-banner',
        `announcement-${announcement.priority}`
      ]"
    >
      <div class="announcement-content">
        <div class="announcement-text">
          <h4 v-if="announcement.headline" class="announcement-headline">
            {{ announcement.headline }}
          </h4>
          <p v-if="announcement.message" class="announcement-message">
            {{ announcement.message }}
          </p>
        </div>
        
        <button 
          @click="dismissBanner"
          class="announcement-dismiss"
          aria-label="Dismiss announcement"
        >
          ✕
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useFeatureFlags } from '@/composables/useFeatureFlags'
  
  const { announcement } = useFeatureFlags()
  
  // Track if user has dismissed the banner
  const isDismissed = ref(false)
  
  // Create a unique key for this announcement to track dismissals
  const announcementKey = computed(() => {
    return `announcement-dismissed-${announcement.headline || 'default'}-${announcement.message || 'default'}`
  })
  
  // Check if this specific announcement was previously dismissed
  onMounted(() => {
    if (announcement.enabled) {
      const dismissed = sessionStorage.getItem(announcementKey.value)
      isDismissed.value = dismissed === 'true'
    }
  })
  
  // Dismiss the banner
  const dismissBanner = () => {
    isDismissed.value = true
    // Remember dismissal for this session only
    sessionStorage.setItem(announcementKey.value, 'true')
  }
  </script>
  
  <style scoped>
  .announcement-banner {
    padding: 12px 16px;
    margin-bottom: 16px;
    border-radius: 4px;
    border-left: 4px solid;
  }
  
  .announcement-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  
  .announcement-text {
    flex: 1;
  }
  
  .announcement-headline {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .announcement-message {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
  }
  
  .announcement-dismiss {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
  
  .announcement-dismiss:hover {
    opacity: 1;
  }
  
  /* Priority-based styling */
  .announcement-info {
    background-color: #e7f3ff;
    border-left-color: #0066cc;
    color: #003d7a;
  }
  
  .announcement-info .announcement-dismiss:hover {
    background-color: rgba(0, 102, 204, 0.1);
  }
  
  .announcement-warning {
    background-color: #fff4e6;
    border-left-color: #ff8c00;
    color: #b8660a;
  }
  
  .announcement-warning .announcement-dismiss:hover {
    background-color: rgba(255, 140, 0, 0.1);
  }
  
  .announcement-alert {
    background-color: #ffebee;
    border-left-color: #d32f2f;
    color: #c62828;
  }
  
  .announcement-alert .announcement-dismiss:hover {
    background-color: rgba(211, 47, 47, 0.1);
  }
  
  .announcement-success {
    background-color: #f1f8e9;
    border-left-color: #388e3c;
    color: #2e7d32;
  }
  
  .announcement-success .announcement-dismiss:hover {
    background-color: rgba(56, 142, 60, 0.1);
  }
  </style>