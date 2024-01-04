<template>
  <div>
    <EmailComponent url="/api/auth/password/reset" title="Set new password" success-title="Password reset accepted" message="Please enter your email and we will send you a link to set your new password." success-message="The link to reset your password has been sent to ehsan@ebi.ac.uk. Please check your email, including the spam/trash folder." btn-txt="Get reset link"/>
  </div>
</template>

<script>
import EmailComponent from './EmailComponent.vue'; // Path to your component

export default {
  components: {
    EmailComponent // Register the component
  }
};
</script>

<style scoped>

</style>
