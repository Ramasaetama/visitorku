<template>
  <div class="py-12">
    <h1 class="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
    
    <div class="max-w-lg">
      <Card>
        <template #header>
          <h2 class="text-xl font-semibold">Send us a message</h2>
        </template>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <Input 
            v-model="form.name" 
            label="Name" 
            placeholder="Your name" 
            required 
          />
          <Input 
            v-model="form.email" 
            label="Email" 
            type="email" 
            placeholder="your@email.com" 
            required 
          />
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700">Message</label>
            <textarea 
              v-model="form.message"
              rows="4"
              placeholder="Your message..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            ></textarea>
          </div>
          <Button type="submit" class="w-full">Send Message</Button>
        </form>
      </Card>
    </div>
    
    <router-link to="/" class="inline-block mt-6 text-sky-500 hover:text-sky-600 font-medium">
      ← Back to Home
    </router-link>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { Button, Input, Card } from '../components/common'

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const handleSubmit = () => {
  console.log('Form submitted:', form)
  // Handle form submission
}
</script>
