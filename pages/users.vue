<script lang="ts" setup>
// Columns
const columns = [
  {
    key: "id",
    label: "#",
    sortable: true,
  },
  {
    key: "name",
    label: "Name",
    sortable: true,
  },
  {
    key: "address",
    label: "Address",
    sortable: true,
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
  },
];

const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);

// Selected Rows
const selectedRows = ref([]);

// Actions
const actions = [
  [
    {
      key: "completed",
      label: "Completed",
      icon: "i-heroicons-check",
    },
  ],
  [
    {
      key: "uncompleted",
      label: "In Progress",
      icon: "i-heroicons-arrow-path",
    },
  ],
];

const page = ref(1);
const search = ref("");
const users = ref([] as any);
const pending = ref(false);
const pagination = ref<any>({
  total: 0,
});
const pageCount = ref(10);
const pageTotal = ref(0);
const sort = ref({ column: "id", direction: "asc" as const });

const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() =>
  Math.min(page.value * pageCount.value, pageTotal.value)
);

async function fetchUser() {
  const query = {
    page: page.value,
    limit: pageCount.value,
  };
  const {
    data,
    pending: p,
    meta,
  } = await $fetch<{ data: any[]; pending: boolean; meta: any }>(
    "http://127.0.0.1:8000/api/users/search",
    {
      method: "post",
      query,
      body: {
        search: { value: search.value },
        sort: [{ field: "created_at", direction: "desc" }],
      },
    }
  );
  users.value = data;
  pending.value = p;
  pagination.value = meta;
}

const isOpen = ref(false);
const userPayload = ref({
  name: "",
  phone: "",
  email: "",
  password: "",
  address: "",
});
async function createUser() {
  await $fetch("http://127.0.0.1:8000/api/users", {
    method: "post",
    body: userPayload.value,
  });
  isOpen.value = false;
}
async function deleteUser(id: number) {
  await $fetch(`http://127.0.0.1:8000/api/users/${id}`, { method: "delete" });
}

onMounted(async () => await fetchUser());

watch(page, fetchUser);
</script>

<template>
  <!-- Create user form -->
  <UModal v-model="isOpen">
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <Placeholder class="h-8">Create User</Placeholder>
      </template>

      <Placeholder>
        <UInput
          v-model="userPayload.name"
          name="name"
          class="mb-5"
          variant="outline"
          placeholder="Name"
        />
        <UInput
          v-model="userPayload.phone"
          name="phone"
          class="mb-5"
          variant="outline"
          placeholder="Phone"
        />
        <UInput
          v-model="userPayload.email"
          name="email"
          class="mb-5"
          variant="outline"
          placeholder="Email"
        />
        <UInput
          v-model="userPayload.password"
          name="password"
          class="mb-5"
          variant="outline"
          placeholder="Password"
        />
        <UInput
          v-model="userPayload.address"
          name="address"
          class="mb-5"
          variant="outline"
          placeholder="Address"
        />
      </Placeholder>

      <template #footer>
        <Placeholder>
          <UButton label="Save" @click="createUser" />
        </Placeholder>
      </template>
    </UCard>
  </UModal>
  <!-- End create user form -->
  <UCard
    class="w-full"
    :ui="{
      base: '',
      ring: '',
      divide: 'divide-y divide-gray-200 dark:divide-gray-700',
      header: { padding: 'px-4 py-5' },
      body: {
        padding: '',
        base: 'divide-y divide-gray-200 dark:divide-gray-700',
      },
      footer: { padding: 'p-4' },
    }"
  >
    <div class="flex items-center justify-between gap-3 px-4 py-3">
      <div>Users</div>
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Search..."
          @blur="fetchUser"
        />
        <UButton label="Create" @click="isOpen = true" />
      </div>
    </div>

    <!-- Header and Action buttons -->
    <div class="flex justify-between items-center w-full px-4 py-3">
      <div class="flex items-center gap-1.5">
        <span class="text-sm leading-5">Rows per page:</span>

        <USelect
          v-model="pageCount"
          :options="[3, 5, 10, 20, 30, 40]"
          class="me-2 w-20"
          size="xs"
          @change="fetchUser()"
        />
      </div>

      <div class="flex gap-1.5 items-center">
        <UDropdown
          v-if="selectedRows.length > 1"
          :items="actions"
          :ui="{ width: 'w-36' }"
        >
          <UButton
            icon="i-heroicons-chevron-down"
            trailing
            color="gray"
            size="xs"
          >
            Mark as
          </UButton>
        </UDropdown>

        <USelectMenu v-model="selectedColumns" :options="columns" multiple>
          <UButton icon="i-heroicons-view-columns" color="gray" size="xs">
            Columns
          </UButton>
        </USelectMenu>
      </div>
    </div>

    <!-- Table -->
    <UTable
      v-model:sort="sort"
      :rows="users"
      :columns="columnsTable"
      :loading="pending"
      sort-asc-icon="i-heroicons-arrow-up"
      sort-desc-icon="i-heroicons-arrow-down"
      sort-mode="manual"
      class="w-full"
    >
      <template #actions-data="{ row }">
        <UButton
          icon="i-heroicons-trash"
          size="2xs"
          color="orange"
          variant="outline"
          :ui="{ rounded: 'rounded-full' }"
          square
          @click="deleteUser(row.id)"
        />
      </template>
    </UTable>

    <!-- Number of rows & Pagination -->
    <template #footer>
      <div class="flex flex-wrap justify-between items-center">
        <div>
          <span class="text-sm leading-5">
            Showing
            <span class="font-medium">{{ pageFrom }}</span>
            to
            <span class="font-medium">{{ pageTo }}</span>
            of
            <span class="font-medium">{{ pagination.total }}</span>
            results
          </span>
        </div>

        <UPagination
          v-model="page"
          :page-count="pageCount"
          :total="pagination.total"
          :ui="{
            wrapper: 'flex items-center gap-1',
            rounded: '!rounded-full min-w-[32px] justify-center',
            default: {
              activeButton: {
                variant: 'outline',
              },
            },
          }"
        />
      </div>
    </template>
  </UCard>
</template>
