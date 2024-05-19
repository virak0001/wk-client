<script lang="ts" setup>
import { debounce } from "lodash-es";
// Columns
const columns = [
  {
    key: "id",
    label: "#",
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "phone",
    label: "phone",
  },
  {
    key: "address",
    label: "Address",
  },
  {
    key: "actions",
    label: "Actions",
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

const useId = ref();
const isOpenDeleteDialog = ref(false);
async function deleteUser(id: number) {
  useId.value = id;
  isOpenDeleteDialog.value = true;
}
async function confirmDeleteUser() {
  await $fetch(`http://127.0.0.1:8000/api/users/${id}`, { method: "delete" });
  isOpenDeleteDialog.value = false;
  users.value = users.value.filters((item: any) => item.id !== useId.value);
}
async function editUser(id: number) {
  const { data } = await $fetch<{ data: any }>(
    `http://127.0.0.1:8000/api/users/${id}`
  );
  userPayload.value = data;
  isOpen.value = true;
}

onMounted(async () => await fetchUser());

watch(page, fetchUser);
watch(
  search,
  debounce(() => {
    page.value = 1;
    fetchUser();
  }, 300)
);
</script>

<template>
  <UModal v-model="isOpenDeleteDialog" :overlay="false">
    <UCard>
      <div class="p-4">
        <Placeholder class="h-48">Are your sure want to delete?</Placeholder>
      </div>
      <template #footer>
        <div class="grid gap-4 grid-cols-2">
          <UButton label="No" @click="isOpenDeleteDialog = false" />
          <UButton color="red" label="Yes" @click="confirmDeleteUser" />
        </div>
      </template>
    </UCard>
  </UModal>
  <!-- Create user form -->
  <UserCreateOrUpdate
    v-model="isOpen"
    v-model:entity="userPayload"
    @saved="fetchUser()"
  />
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
      class="h-[calc(100vh - 210px)]"
    >
      <template #actions-data="{ row }">
        <UButton
          icon="i-heroicons-trash"
          size="2xs"
          color="orange"
          variant="outline"
          :ui="{ rounded: 'rounded-full' }"
          square
          class="mr-1"
          @click="deleteUser(row.id)"
        />
        <UButton
          icon="i-heroicons-pencil"
          size="2xs"
          color="orange"
          variant="outline"
          :ui="{ rounded: 'rounded-full' }"
          square
          @click="editUser(row.id)"
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
