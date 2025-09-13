<template>
  <div class="register-page">
    <v-container fluid class="fill-height">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card elevation="8" class="pa-8">
            <div class="text-center mb-6">
              <v-icon size="60" color="primary" class="mb-3">
                mdi-account-plus
              </v-icon>
              <h1 class="text-h4 font-weight-bold text-primary">
                Create Account
              </h1>
              <p class="text-body-1 text-grey-darken-1">
                Join Nipon Payroll Pro today
              </p>
            </div>

            <v-form>
              <v-text-field
                label="Company Name"
                variant="outlined"
                prepend-inner-icon="mdi-domain"
                class="mb-4"
              />
              
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    label="First Name"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    label="Last Name"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-text-field
                label="Email Address"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                class="mb-4"
              />

              <v-text-field
                label="Password"
                type="password"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                class="mb-4"
              />

              <v-btn
                color="primary"
                size="large"
                block
                class="mb-4"
              >
                Create Account
              </v-btn>

              <div class="text-center">
                <span class="text-body-2 text-grey-darken-1">
                  Already have an account?
                </span>
                <v-btn
                  variant="text"
                  :to="{ name: 'Login' }"
                  class="text-body-2 font-weight-medium"
                >
                  Sign In
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
// Registration component - to be implemented
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>