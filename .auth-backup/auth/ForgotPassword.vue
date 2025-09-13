<template>
  <div class="forgot-password-page">
    <v-container fluid class="fill-height">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card elevation="8" class="pa-8">
            <div class="text-center mb-6">
              <v-icon size="60" color="primary" class="mb-3">
                mdi-lock-reset
              </v-icon>
              <h1 class="text-h4 font-weight-bold text-primary">
                Reset Password
              </h1>
              <p class="text-body-1 text-grey-darken-1">
                Enter your email to receive reset instructions
              </p>
            </div>

            <v-form>
              <v-text-field
                label="Email Address"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                class="mb-4"
              />

              <v-btn
                color="primary"
                size="large"
                block
                class="mb-4"
              >
                Send Reset Link
              </v-btn>

              <div class="text-center">
                <v-btn
                  variant="text"
                  :to="{ name: 'Login' }"
                  class="text-body-2"
                >
                  Back to Login
                </v-btn>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// Forgot password component - to be implemented
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>