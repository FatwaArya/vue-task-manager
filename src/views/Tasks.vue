<script setup lang="ts">
defineOptions({ name: 'TasksView' })
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import Toolbar from 'primevue/toolbar'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog'
import Tag from 'primevue/tag'

type Task = {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

const auth = useAuthStore()
const toast = useToast()
const confirm = useConfirm()

const page = ref(1)
const limit = ref(10)
const sortBy = ref<'createdAt' | 'title' | 'priority' | 'dueDate'>('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')
const search = ref('')
const statuses = ref<Array<'todo' | 'in_progress' | 'done'>>([])
const dialogVisible = ref(false)

const headers = computed(() => ({ ...auth.authHeader }))
const queryClient = useQueryClient()

const queryParams = computed(() => ({
  page: page.value,
  limit: limit.value,
  sortBy: sortBy.value,
  sortDir: sortDir.value,
  search: search.value || undefined,
  status: statuses.value.length ? statuses.value.join(',') : undefined,
}))

const { data, isLoading, refetch, isFetching } = useQuery({
  queryKey: ['tasks', queryParams],
  queryFn: async () => {
    const res = await axios.get('/api/tasks', { params: queryParams.value, headers: headers.value })
    return res.data as {
      data: Task[]
      meta: {
        page: number
        limit: number
        total: number
        pageCount: number
        hasNext: boolean
        hasPrev: boolean
      }
    }
  },
  enabled: computed(() => Boolean(auth.isAuthenticated)),
})

const items = computed(() => data?.value?.data ?? [])
const pageCount = computed(() => data?.value?.meta.pageCount ?? 1)
const hasNext = computed(() => data?.value?.meta.hasNext ?? false)
const hasPrev = computed(() => data?.value?.meta.hasPrev ?? false)
const loading = computed(() => isLoading.value || isFetching.value)

watch([page, limit, sortBy, sortDir, statuses, search, headers], () => refetch())

// CRUD
const editing = ref<Task | null>(null)
const form = ref<{
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate: Date | null
}>({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: null })

function startCreate() {
  editing.value = null
  form.value = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: null }
  dialogVisible.value = true
}
function startEdit(task: Task) {
  editing.value = task
  form.value = {
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority || 'medium',
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
  }
  dialogVisible.value = true
}

const createMutation = useMutation({
  mutationFn: async (payload: {
    title: string
    description: string
    status: Task['status']
    priority: NonNullable<Task['priority']>
    dueDate: string | null
  }) => {
    const res = await axios.post('/api/tasks', payload, { headers: headers.value })
    return res.data as { data: Task }
  },
  onSuccess: async () => {
    toast.add({ severity: 'success', summary: 'Task created', life: 1500 })
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
  },
})

const updateMutation = useMutation({
  mutationFn: async ({
    id,
    payload,
  }: {
    id: string
    payload: {
      title: string
      description: string
      status: Task['status']
      priority: NonNullable<Task['priority']>
      dueDate: string | null
    }
  }) => {
    const res = await axios.put(`/api/tasks/${id}`, payload, { headers: headers.value })
    return res.data as { data: Task }
  },
  onSuccess: async () => {
    toast.add({ severity: 'success', summary: 'Task updated', life: 1500 })
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
  },
})

const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const res = await axios.delete(`/api/tasks/${id}`, { headers: headers.value })
    return res.data as { data: Task }
  },
  onSuccess: async () => {
    toast.add({ severity: 'success', summary: 'Task deleted', life: 1500 })
    await queryClient.invalidateQueries({ queryKey: ['tasks'] })
  },
})

async function save() {
  const payload = {
    title: form.value.title,
    description: form.value.description,
    status: form.value.status,
    priority: form.value.priority,
    dueDate: form.value.dueDate ? new Date(form.value.dueDate).toISOString().slice(0, 10) : null,
  }
  try {
    if (editing.value) {
      await updateMutation.mutateAsync({ id: editing.value.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    dialogVisible.value = false
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    toast.add({
      severity: 'error',
      summary: err?.response?.data?.message || 'Save failed',
      life: 2500,
    })
  }
}

const canSave = computed(() => form.value.title.trim().length > 0)

function confirmRemove(task: Task) {
  confirm.require({
    message: 'Delete this task?',
    header: 'Confirm',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteMutation.mutateAsync(task.id)
      } catch (e: unknown) {
        const err = e as { response?: { data?: { message?: string } } }
        toast.add({
          severity: 'error',
          summary: err?.response?.data?.message || 'Delete failed',
          life: 2500,
        })
      }
    },
  })
}
</script>

<template>
  <div class="p-4">
    <Toast />
    <ConfirmDialog />
    <Toolbar class="mb-4 border-none bg-transparent px-0">
      <template #start>
        <div class="flex gap-6 flex-wrap items-end">
          <InputText v-model="search" placeholder="Search" @keyup.enter="refetch()" />
          <SelectButton
            v-model="statuses"
            :options="['todo', 'in_progress', 'done']"
            multiple
            aria-labelledby="statuses"
          />
          <Dropdown
            v-model="sortBy"
            :options="['createdAt', 'title', 'priority', 'dueDate']"
            placeholder="Sort by"
          />
          <Dropdown v-model="sortDir" :options="['asc', 'desc']" placeholder="Order" />
          <InputNumber v-model="limit" :min="5" :max="50" inputClass="w-24" />
          <Button
            label="Filter"
            icon="pi pi-sliders-h"
            outlined
            @click="refetch()"
            :loading="loading"
          />
        </div>
      </template>
      <template #end>
        <Button label="New Task" icon="pi pi-plus" outlined @click="startCreate" />
      </template>
    </Toolbar>

    <DataTable
      :value="items"
      :loading="loading"
      dataKey="id"
      paginator
      :rows="limit"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      tableStyle="min-width: 50rem"
      class="border-none"
      stripedRows
    >
      <Column field="title" header="Title">
        <template #body="{ data }">
          <div class="font-medium">{{ data.title }}</div>
          <div class="text-xs text-muted-color">{{ data.description || '\u00A0' }}</div>
        </template>
      </Column>
      <Column field="status" header="Status">
        <template #body="{ data }">
          <Tag
            :value="data.status.toUpperCase()"
            :severity="
              data.status === 'done'
                ? 'success'
                : data.status === 'in_progress'
                  ? 'info'
                  : 'secondary'
            "
            class="text-xs"
          />
        </template>
      </Column>
      <Column field="priority" header="Priority">
        <template #body="{ data }">
          <Tag
            :value="(data.priority || 'medium').toUpperCase()"
            :severity="
              data.priority === 'high' ? 'danger' : data.priority === 'low' ? 'secondary' : 'warn'
            "
            class="text-xs"
          />
        </template>
      </Column>
      <Column field="dueDate" header="Due">
        <template #body="{ data }">{{ data.dueDate || '-' }}</template>
      </Column>
      <Column header="Actions" :exportable="false">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" rounded text @click="startEdit(data)" />
            <Button
              icon="pi pi-trash"
              rounded
              text
              severity="danger"
              @click="confirmRemove(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <div class="flex items-center gap-2 mt-3">
      <Button label="Prev" :disabled="!hasPrev" @click="page--" />
      <span>Page {{ page }} / {{ pageCount }}</span>
      <Button label="Next" :disabled="!hasNext" @click="page++" />
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      dismissableMask
      :header="editing ? 'Edit Task' : 'New Task'"
      :style="{ width: '36rem' }"
      pt:header="{ class: 'text-base font-semibold' }"
    >
      <div class="flex flex-col space-y-2 p-2">
        <span class="p-float-label">
          <label class="text-xs mb-1 block">Title</label>

          <InputText id="title" v-model="form.title" placeholder="Task title" />
        </span>
        <label class="text-xs mb-1 block">Description</label>
        <Textarea
          id="desc"
          v-model="form.description"
          rows="4"
          autoResize
          placeholder="Description (optional)"
        />
        <div class="flex flex-col md:flex-row gap-3">
          <div class="flex-1">
            <label class="text-xs mb-1 block">Status</label>
            <SelectButton v-model="form.status" :options="['todo', 'in_progress', 'done']" />
          </div>
          <div class="flex-1">
            <label class="text-xs mb-1 block">Priority</label>
            <SelectButton v-model="form.priority" :options="['low', 'medium', 'high']" />
          </div>
        </div>
        <label for="due" class="text-xs mb-1 block">Due date</label>
        <Calendar
          id="due"
          v-model="form.dueDate"
          dateFormat="yy-mm-dd"
          showIcon
          :manualInput="false"
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <Button label="Cancel" severity="secondary" text @click="dialogVisible = false" />
          <Button label="Save" icon="pi pi-check" :disabled="!canSave" outlined @click="save" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped></style>
