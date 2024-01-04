<template>
  <div>
    <EmailComponent @email-updated="handleEmailUpdate" url="/api/auth/retryact" title="Send activation email" message="Please enter your email and we will send you a link to activate your account." btn-txt="Send activation link"
                    successTitle="Activation email sent" :success-message="successMessage"/>
  </div>
</template>

<style scoped>

</style>
<script>
  import EmailComponent from "./EmailComponent.vue";

  export default {
    components: {
      EmailComponent,
    },
    data() {
      return {
        userEmail: '',
        successMessage: ''
      };
    },
    methods: {
      handleEmailUpdate(email) {
        this.userEmail = email;
        this.successMessage = `The activation link has been sent to ${email}. Please check your email, including the spam/trash folder.`;
      },
    },
  };

</script>
