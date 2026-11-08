<template>
  <q-page class="aura-page flex flex-center q-pa-md">
    <div class="wrap row q-col-gutter-xl items-center">
      <div class="col-12 col-md-6">
        <div class="eyebrow">✦ AURA · EARLY ACCESS</div>
        <h1>Connect through <span>vibes,</span><br>not looks.</h1>
        <p class="lead">Discover meaningful connections through shared beliefs, personality, and relationship goals. Be among our first beta testers.</p>
        <div class="reward"><div class="reward-icon">✦</div><div><strong>1 MONTH FREE PREMIUM</strong><div>For beta testers after the official launch</div></div></div>
        <div class="perks">✓ Early access &nbsp; ✓ Founding Member badge &nbsp; ✓ Premium reward</div>
      </div>
      <div class="col-12 col-md-6">
        <q-card class="signup-card">
          <q-card-section>
            <div class="card-kicker">YOUR AURA STARTS HERE</div>
            <h2>Join the beta waitlist</h2>
            <p class="muted">Tell us what matters to you. Your preferences are private and can be changed later.</p>
            <q-form @submit.prevent="register" class="q-gutter-md">
              <q-input dark outlined v-model.trim="form.name" label="Your name" :rules="[v => !!v || 'Required']" />
              <q-input dark outlined v-model.trim="form.email" label="Email address" type="email" :rules="[v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email']" />
              <q-select dark outlined v-model="form.religion" :options="religions" label="Religion preference" />
              <div class="field-title">Preferred age: {{ form.minAge }}–{{ form.maxAge }}</div>
              <q-range v-model="ageRange" :min="18" :max="60" :step="1" color="purple-4" label :left-label-value="String(form.minAge)" :right-label-value="String(form.maxAge)" />
              <q-select dark outlined v-model="form.goal" :options="goals" label="Relationship goal" />
              <q-checkbox dark v-model="form.adult" label="I confirm I am 18 or older" />
              <q-checkbox dark v-model="form.sensitiveConsent" label="I consent to storing my religion preference for beta matching research" />
              <q-checkbox dark v-model="form.consent" label="I agree to receive beta invitations by email and to the privacy notice" />
              <q-btn unelevated no-caps class="submit-btn full-width" type="submit" :loading="loading" label="Join AURA Beta →" />
              <div class="footnote">18+ only · Free to join · Premium begins after official launch</div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useQuasar } from 'quasar'
const $q = useQuasar()
const loading = ref(false)
const religions = ['Any religion', 'Catholic', 'Iglesia Ni Cristo', 'Other Christian', 'Islam', 'Other', 'Prefer not to say']
const goals = ['Serious relationship', 'Casual dating', 'Friendship first']
const form = reactive({ name: '', email: '', religion: 'Any religion', minAge: 18, maxAge: 30, goal: 'Serious relationship', adult: false, consent: false, sensitiveConsent: false })
const ageRange = computed({ get: () => ({ min: form.minAge, max: form.maxAge }), set: v => { form.minAge = v.min; form.maxAge = v.max } })
async function register () {
  if (!form.adult || !form.consent || !form.sensitiveConsent) { $q.notify({ type: 'warning', message: 'Please confirm you are 18+ and agree to the privacy notice.' }); return }
  loading.value = true
  try {
    const response = await fetch('/api/beta/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, religionPreference: form.religion, preferredAgeMin: form.minAge, preferredAgeMax: form.maxAge, relationshipGoal: form.goal, adultConfirmed: form.adult, emailConsent: form.consent, sensitivePreferenceConsent: form.sensitiveConsent }) })
    if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'Registration failed. Please try again.') }
    $q.notify({ type: 'positive', message: 'You joined the AURA beta waitlist!' })
  } catch (e) { $q.notify({ type: 'negative', message: e.message }) }
  finally { loading.value = false }
}
</script>

<style scoped>
.aura-page{min-height:100vh;background:radial-gradient(ellipse at 15% 20%,#3c205f 0%,transparent 43%),radial-gradient(ellipse at 90% 80%,#39214b 0%,transparent 40%),#100d1d;color:#fff;font-family:Inter,system-ui,sans-serif}.wrap{max-width:1140px;width:100%;margin:auto}.eyebrow,.card-kicker{color:#c7a7ff;letter-spacing:2px;font-size:12px;font-weight:700}h1{font-size:clamp(42px,5.5vw,78px);font-weight:800;line-height:1.08;letter-spacing:-2px;margin:20px 0}h1 span{background:linear-gradient(90deg,#c6a3ff,#fa9ce0);color:transparent;background-clip:text}.lead{font-size:17px;color:#c4bdd1;line-height:1.75;max-width:510px}.reward{display:flex;align-items:center;gap:16px;padding:20px;margin-top:30px;background:rgba(151,96,235,.12);border:1px solid rgba(198,160,255,.35);border-radius:18px}.reward strong{color:#e4c8ff;letter-spacing:.8px}.reward div div{font-size:13px;color:#bfb4d1;margin-top:5px}.reward-icon{font-size:28px;color:#caa8ff}.perks{font-size:13px;color:#b8abc9;margin-top:20px;line-height:2}.signup-card{background:#201a32;border:1px solid #49395e;color:white;border-radius:24px;box-shadow:0 24px 80px #0005}.signup-card .q-card__section{padding:clamp(22px,4vw,38px)}h2{font-size:29px;font-weight:750;line-height:1.2;margin:12px 0}.muted{color:#bfb5cf;font-size:13px;line-height:1.6;margin-bottom:22px}.field-title{color:#e5dcf0;font-size:14px}.submit-btn{background:linear-gradient(100deg,#8852ed,#bd69da);height:50px;font-weight:700;border-radius:11px}.footnote{font-size:11px;color:#a99dbb;text-align:center}.q-checkbox{font-size:12px}@media(max-width:1023px){.wrap{padding-top:40px;padding-bottom:40px}}
</style>
