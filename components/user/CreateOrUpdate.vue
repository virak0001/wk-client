<script setup lang="ts">
import type { UserEntity } from "~/domains/user/interface";
import { Errors, Validator } from "@chantouchsek/validatorjs";

const { modelValue, entity } = defineModels<{
  modelValue: boolean;
  entity: UserEntity;
}>();
const emits = defineEmits<{
  'saved': any
}>()

const rules = ref({
  name: "required",
  phone: "required",
  email: "required|email",
  address: "required|max:255",
})

const errors = ref(new Errors());

async function createOrUpdate() {
  if(!entity.value.id) {
    Object.assign(rules.value, { password: 'required|min:8' })
  }
  const validation = new Validator(entity.value, rules.value);
  if (validation.fails()) {
    errors.value.fill(validation.errors.all());
  } else {
    // Create User
    if (!entity.value.id) {
      await $fetch("http://127.0.0.1:8000/api/users", {
        method: "post",
        body: entity.value,
      });
      // Update user
    } else {
      await $fetch(`http://127.0.0.1:8000/api/users/${entity.value.id}`, {
        method: "put",
        body: entity.value,
      });
    }
    modelValue.value = false;
  }
  emits('saved')
}

function cancel() {
  modelValue.value = false;
  errors.value.flush()
  entity.value = {} as UserEntity;
}
</script>
<template>
  <UModal v-model="modelValue">
    <UCard :ui="{
      ring: '',
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
    }">
      <template #header>
        <div class="h-8">Create User</div>
      </template>
      <div class="grid gap-4">
        <UFormGroup label="Name" :error="errors.first('name')">
          <UInput v-model="entity.name" placeholder="Enter name" />
        </UFormGroup>
        <UFormGroup label="Phone" :error="errors.first('phone')">
          <UInput v-model="entity.phone" placeholder="Enter phone" />
        </UFormGroup>
        <UFormGroup label="Email" :error="errors.first('email')">
          <UInput v-model="entity.email" placeholder="Enter email" />
        </UFormGroup>
        <UFormGroup v-if="!entity.id" label="Password" :error="errors.first('password')">
          <UInput v-model="entity.password" placeholder="Enter password" />
        </UFormGroup>
        <UFormGroup label="Address" :error="errors.first('address')">
          <UInput v-model="entity.address" placeholder="Enter address" />
        </UFormGroup>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="red" @click="cancel" />
          <UButton label="Save" @click="createOrUpdate" />
        </div>
      </template>
    </UCard>
  </UModal>
</template>
