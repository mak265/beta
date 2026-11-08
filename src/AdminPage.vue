<template>
  <q-page class="admin-page q-pa-md">
    <div class="admin-wrap">
      <header class="row items-center justify-between q-mb-lg">
        <div>
          <div class="eyebrow">AURA · PRIVATE ADMIN</div>
          <h1 class="page-title">Beta signups</h1>
        </div>
        <q-btn v-if="auth" outline no-caps color="white" label="Log out" @click="logout" />
      </header>

      <q-card v-if="!auth" class="admin-card login-card">
        <q-card-section>
          <h2 class="section-title">Admin sign in</h2>
          <p class="muted">Sign in to view private waitlist submissions.</p>
          <q-form class="q-gutter-md" @submit.prevent="login">
            <q-input v-model.trim="username" outlined label="Username" autocomplete="username" />
            <q-input v-model="password" outlined label="Password" type="password" autocomplete="current-password" />
            <div v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</div>
            <q-btn unelevated no-caps class="submit-btn full-width" type="submit" :loading="loading" label="Sign in" />
          </q-form>
        </q-card-section>
      </q-card>

      <q-card v-else class="admin-card">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col-12 col-sm">
            <q-input
              v-model="search"
              outlined
              clearable
              label="Search name or email"
              @keyup.enter="searchSignups"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn unelevated no-caps class="submit-btn" label="Search" :loading="loading" @click="searchSignups" />
          </div>
          <div class="col-12 col-sm-auto total-count">{{ total }} signups</div>
        </q-card-section>

        <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mx-md q-mb-md" rounded role="alert">
          {{ errorMessage }}
        </q-banner>

        <q-table
          flat
          :rows="signups"
          :columns="columns"
          row-key="_id"
          :loading="loading"
          :grid="$q.screen.lt.md"
          hide-bottom
          :pagination="{ page: currentPage, rowsPerPage: pageSize, rowsNumber: total }"
          :rows-per-page-options="[pageSize]"
          @request="onTableRequest"
        >
          <template #body-cell-createdAt="props">
            <q-td :props="props">{{ formatDate(props.value) }}</q-td>
          </template>
          <template #body-cell-ageRange="props">
            <q-td :props="props">{{ props.row.preferredAgeMin }}–{{ props.row.preferredAgeMax }}</q-td>
          </template>
          <template #item="props">
            <div class="q-pa-xs col-12">
              <q-card flat bordered class="signup-card">
                <q-card-section>
                  <div class="signup-name">{{ props.row.name }}</div>
                  <div>{{ props.row.email }}</div>
                  <div class="signup-detail">Joined {{ formatDate(props.row.createdAt) }}</div>
                  <q-separator class="q-my-sm" />
                  <div><strong>Religion:</strong> {{ props.row.religionPreference }}</div>
                  <div><strong>Age:</strong> {{ props.row.preferredAgeMin }}–{{ props.row.preferredAgeMax }}</div>
                  <div><strong>Goal:</strong> {{ props.row.relationshipGoal }}</div>
                  <div><strong>Premium reward:</strong> {{ props.row.premiumRewardStatus }} ({{ props.row.premiumRewardMonths }} month)</div>
                  <div class="signup-detail q-mt-sm">
                    Adult confirmed: {{ props.row.adultConfirmed ? 'Yes' : 'No' }} ·
                    Email consent: {{ props.row.emailConsent ? 'Yes' : 'No' }} ·
                    Sensitive preference consent: {{ props.row.sensitivePreferenceConsent ? 'Yes' : 'No' }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </template>
          <template #no-data>
            <div class="full-width row flex-center q-pa-lg muted">
              {{ loading ? 'Loading signups…' : 'No signups found.' }}
            </div>
          </template>
        </q-table>

        <div class="row items-center justify-between q-pa-md">
          <div class="muted">Page {{ currentPage }} of {{ pageCount }}</div>
          <div class="row q-gutter-sm">
            <q-btn outline no-caps color="white" label="Previous" :disable="loading || currentPage <= 1" @click="loadPage(currentPage - 1)" />
            <q-btn outline no-caps color="white" label="Next" :disable="loading || currentPage >= pageCount" @click="loadPage(currentPage + 1)" />
          </div>
        </div>
      </q-card>

      <p class="privacy-note">Private signup information. Keep this page and its login credentials confidential.</p>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const username = ref('')
const password = ref('')
const auth = ref('')
const search = ref('')
const signups = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 50
const loading = ref(false)
const errorMessage = ref('')
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: false },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: false },
  { name: 'religionPreference', label: 'Religion preference', field: 'religionPreference', align: 'left', sortable: false },
  { name: 'ageRange', label: 'Preferred age', field: 'preferredAgeMin', align: 'left', sortable: false },
  { name: 'relationshipGoal', label: 'Relationship goal', field: 'relationshipGoal', align: 'left', sortable: false },
  { name: 'premiumRewardStatus', label: 'Premium reward', field: row => `${row.premiumRewardStatus} (${row.premiumRewardMonths} month)`, align: 'left', sortable: false },
  { name: 'createdAt', label: 'Joined', field: 'createdAt', align: 'left', sortable: false }
]

async function loadPage (page = 1) {
  if (!auth.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search.value.trim()) params.set('search', search.value.trim())
    const response = await fetch(`/api/admin/signups?${params}`, {
      headers: { Authorization: `Basic ${auth.value}` },
      cache: 'no-store'
    })
    const data = await response.json()
    if (!response.ok) {
      if (response.status === 401) {
        auth.value = ''
        password.value = ''
      }
      throw new Error(data.message || 'Unable to load signups.')
    }
    signups.value = data.signups
    total.value = data.total
    currentPage.value = data.page
  } catch (error) {
    errorMessage.value = error.message || 'Unable to reach the server.'
  } finally {
    loading.value = false
  }
}

async function login () {
  if (!username.value || !password.value) {
    errorMessage.value = 'Enter your admin username and password.'
    return
  }
  auth.value = btoa(`${username.value}:${password.value}`)
  await loadPage(1)
}

function searchSignups () {
  loadPage(1)
}

function onTableRequest ({ pagination }) {
  loadPage(pagination.page)
}

function logout () {
  auth.value = ''
  password.value = ''
  signups.value = []
  total.value = 0
  currentPage.value = 1
  errorMessage.value = ''
}

function formatDate (value) {
  return value ? new Date(value).toLocaleString() : '—'
}
</script>

<style scoped>
.admin-page{min-height:100vh;background:radial-gradient(ellipse at 15% 20%,#3c205f 0%,transparent 43%),radial-gradient(ellipse at 90% 80%,#39214b 0%,transparent 40%),#100d1d;color:#fff;font-family:Inter,system-ui,sans-serif}.admin-wrap{max-width:1180px;margin:0 auto}.eyebrow{color:#c7a7ff;letter-spacing:2px;font-size:12px;font-weight:700}.page-title{font-size:clamp(34px,5vw,52px);font-weight:800;line-height:1.1;margin:10px 0}.admin-card{background:#201a32;border:1px solid #49395e;color:white;border-radius:20px;box-shadow:0 24px 80px #0005}.login-card{max-width:460px;margin:8vh auto}.section-title{font-size:26px;margin:0 0 8px}.muted,.privacy-note{color:#bfb5cf;font-size:13px}.submit-btn{background:linear-gradient(100deg,#8852ed,#bd69da);height:46px;font-weight:700;border-radius:10px}.error-message{color:#ffaaa5;font-size:14px}.total-count{color:#e4c8ff;font-weight:700;white-space:nowrap}.signup-card{background:#2a223d;color:white;border-color:#49395e}.signup-name{font-size:18px;font-weight:700}.signup-detail{font-size:12px;color:#bfb5cf}.privacy-note{text-align:center;margin:18px 0}@media(max-width:599px){.admin-page{padding:18px}.page-title{font-size:36px}}
</style>
