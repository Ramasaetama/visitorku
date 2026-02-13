<template>
  <div>
    <!-- Hero Section -->
    <section class="text-center py-16">
      <h1 class="text-h1 font-bold text-gray-900 mb-4">
        Welcome to Visitorku
      </h1>
      <p class="text-body-1 text-gray-600 mb-8 max-w-2xl mx-auto">
        Setup project Vue berhasil! Sekarang Anda bisa mulai slicing dari Figma.
      </p>
      <div class="flex justify-center gap-4">
        <Button size="lg">Get Started</Button>
        <Button variant="outline" size="lg">
          <router-link to="/about">Learn More</router-link>
        </Button>
      </div>
    </section>

    <!-- Example Components -->
    <section class="py-12">
      <h2 class="text-h2 font-bold text-gray-900 mb-8">Example Components</h2>
      
      <div class="grid md:grid-cols-3 gap-6">
        <Card hoverable>
          <template #header>
            <h3 class="text-title-4 font-semibold text-gray-900">Card Title</h3>
          </template>
          <p class="text-body-3 text-gray-600">
            This is an example card component. Customize sesuai Figma design Anda.
          </p>
          <template #footer>
            <Button size="sm">Action</Button>
          </template>
        </Card>

        <Card hoverable>
          <template #header>
            <h3 class="text-title-4 font-semibold text-gray-900">Form Example</h3>
          </template>
          <div class="space-y-4">
            <Input label="Email" type="email" placeholder="Enter your email" />
            <Input label="Password" type="password" placeholder="Enter your password" />
            <Button class="w-full">Submit</Button>
          </div>
        </Card>

        <Card hoverable>
          <template #header>
            <h3 class="text-title-4 font-semibold text-gray-900">Button Variants</h3>
          </template>
          <div class="space-y-3">
            <Button class="w-full">Primary</Button>
            <Button variant="secondary" class="w-full">Secondary</Button>
            <Button variant="outline" class="w-full">Outline</Button>
            <Button variant="ghost" class="w-full">Ghost</Button>
          </div>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Button, Input, Card } from '../components/common'
</script>
