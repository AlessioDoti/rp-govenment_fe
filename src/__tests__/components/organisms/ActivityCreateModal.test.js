import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ActivityCreateModal from '@/components/organisms/ActivityCreateModal.vue'

vi.mock('@/services/api.js', () => ({
  api: {
    getCategories: vi.fn(),
    searchPersons: vi.fn(),
    createActivity: vi.fn(),
    createPerson: vi.fn(),
    updateActivity: vi.fn(),
    getPersonByUserId: vi.fn(),
    getPersonByUuid: vi.fn(),
    getCategoryById: vi.fn(),
    getActivities: vi.fn(),
    getActivityById: vi.fn(),
    getTaxesByActivity: vi.fn(),
    getActivitiesByUserId: vi.fn(),
    getActivityByEmployee: vi.fn(),
    searchUsers: vi.fn(),
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    updateUserRole: vi.fn(),
    deleteUser: vi.fn(),
    ensureValidToken: vi.fn(),
    refreshAccessToken: vi.fn()
  }
}))

import { api } from '@/services/api.js'

vi.mock('@/utils/clickPosition.js', () => ({ lastClickY: { value: 0 } }))

const mockCategories = [
  { id: 1, name: 'Ristorazione', categoryTaxes: [] },
  { id: 2, name: 'Commercio', categoryTaxes: [] }
]

const mockPeople = {
  data: [
    { id: 1, name: 'Mario', surname: 'Rossi', externalUuid: 'uuid-mario' },
    { id: 2, name: 'Luigi', surname: 'Verdi', externalUuid: 'uuid-luigi' }
  ]
}

const createdActivity = { id: 42, name: 'Test', category: 1, address: 0, employees: [] }

describe('ActivityCreateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    api.getCategories.mockResolvedValue(mockCategories)
    api.searchPersons.mockResolvedValue(mockPeople)
    api.createActivity.mockResolvedValue(createdActivity)
    api.updateActivity.mockResolvedValue({})

    document.body.innerHTML = ''
  })

  it('renders the modal with title and form fields', async () => {
    mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    expect(document.body.querySelector('.modal-title')?.textContent).toContain('Nuova attività')
    expect(document.body.querySelector('#act-name')).toBeTruthy()
    expect(document.body.querySelector('#act-address')).toBeTruthy()
    expect(document.body.querySelector('#act-category')).toBeTruthy()
    expect(document.body.querySelector('.modal-footer')).toBeTruthy()
  })

  it('loads categories on mount', async () => {
    mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()
    await new Promise(r => setTimeout(r, 50))

    expect(api.getCategories).toHaveBeenCalled()
    const items = document.body.querySelectorAll('#act-category li')
    expect(items.length).toBe(2)
    expect(items[0]?.textContent).toBe('Ristorazione')
    expect(items[1]?.textContent).toBe('Commercio')
  })

  it('loads people on mount and shows search tab', async () => {
    mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    expect(api.searchPersons).toHaveBeenCalledWith({}, { page: 0, size: 100 })
    // Verify search tab content is shown (default mode = 'search')
    const filterLabel = document.body.querySelector('label[for="emp-filter"]')
    expect(filterLabel).toBeTruthy()
    expect(filterLabel?.textContent).toContain('Filtra persone')
  })

  it('disables save button when required fields are empty', async () => {
    mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    const saveBtn = document.body.querySelector('.modal-footer .btn-primary')
    // Button is disabled because name and category are empty (canSave = false)
    expect(saveBtn?.hasAttribute('disabled')).toBe(true)
    expect(api.createActivity).not.toHaveBeenCalled()
  })

  it('calls createActivity API on valid save', async () => {
    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    const nameInput = document.body.querySelector('#act-name')
    nameInput && setValue(nameInput, 'Nuovo Ristorante')
    wrapper.vm.selectedCategoryId = 1
    await flushPromises()

    const saveBtn = document.body.querySelector('.modal-footer .btn-primary')
    saveBtn?.click()
    await flushPromises()

    expect(api.createActivity).toHaveBeenCalledWith('Nuovo Ristorante', 1, 0)
  })

  it('emits saved after successful creation', async () => {
    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    const nameInput = document.body.querySelector('#act-name')
    nameInput && setValue(nameInput, 'Test')
    wrapper.vm.selectedCategoryId = 1
    await flushPromises()

    const saveBtn = document.body.querySelector('.modal-footer .btn-primary')
    saveBtn?.click()
    await flushPromises()

    expect(wrapper.emitted('saved')).toBeTruthy()
  })

  it('emits close when cancel is clicked', async () => {
    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    const cancelBtn = document.body.querySelector('.modal-footer .btn-secondary')
    cancelBtn?.click()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close when backdrop is clicked', async () => {
    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    const modal = document.body.querySelector('.modal')
    modal?.click()
    await flushPromises()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows error alert on save failure', async () => {
    api.createActivity.mockRejectedValueOnce(new Error('API error'))

    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    const nameInput = document.body.querySelector('#act-name')
    nameInput && setValue(nameInput, 'Test')
    wrapper.vm.selectedCategoryId = 1
    await flushPromises()

    const saveBtn = document.body.querySelector('.modal-footer .btn-primary')
    saveBtn?.click()
    await flushPromises()

    expect(document.body.textContent).toContain('Impossibile creare')
  })

  it('disables save button when saving', async () => {
    let resolveCreate
    api.createActivity.mockReturnValueOnce(new Promise((resolve) => { resolveCreate = resolve }))

    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    const nameInput = document.body.querySelector('#act-name')
    nameInput && setValue(nameInput, 'Test')
    wrapper.vm.selectedCategoryId = 1
    await flushPromises()

    const saveBtn = document.body.querySelector('.modal-footer .btn-primary')
    saveBtn?.click()
    await flushPromises()

    expect(saveBtn?.hasAttribute('disabled')).toBe(true)

    resolveCreate(createdActivity)
    await flushPromises()
  })

  it('calls updateActivity with employees when employees are added', async () => {
    api.createPerson.mockResolvedValueOnce({ externalUuid: 'uuid-new', name: 'New', surname: 'Person' })

    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    // Fill activity details
    const nameInput = document.body.querySelector('#act-name')
    nameInput && setValue(nameInput, 'Test')
    wrapper.vm.selectedCategoryId = 1
    await flushPromises()

    // Switch to create person tab
    const tabs = document.body.querySelectorAll('.btn-group .btn')
    tabs[1]?.click()
    await flushPromises()

    // Fill new person form
    const newNameInput = document.body.querySelector('#new-emp-name')
    newNameInput && setValue(newNameInput, 'New')
    const newSurnameInput = document.body.querySelector('#new-emp-surname')
    newSurnameInput && setValue(newSurnameInput, 'Person')
    const newBirthInput = document.body.querySelector('#new-emp-birth')
    newBirthInput && setValue(newBirthInput, '1990-01-01')
    const newRoleInput = document.body.querySelector('#new-emp-role')
    newRoleInput && setValue(newRoleInput, 'Manager')
    await flushPromises()

    // Click "Crea e aggiungi"
    const addBtns = document.body.querySelectorAll('.modal-body .btn-outline-primary')
    addBtns[addBtns.length - 1]?.click()
    await flushPromises()

    expect(api.createPerson).toHaveBeenCalledWith({
      name: 'New',
      surname: 'Person',
      birthDate: '1990-01-01'
    })

    // Now save the activity
    const saveBtn = document.body.querySelector('.modal-footer .btn-primary')
    saveBtn?.click()
    await flushPromises()

    expect(api.createActivity).toHaveBeenCalledWith('Test', 1, 0)
    expect(api.updateActivity).toHaveBeenCalledWith(42, {
      employees: [{ employeeUuid: 'uuid-new', role: 'Manager' }]
    })
  })

  it('can search and select an existing person as employee', async () => {
    api.createActivity.mockResolvedValueOnce({ id: 42 })
    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    // Use wrapper.vm to set inputs directly (reliable vs DOM event dispatching)
    const nameInput = document.body.querySelector('#act-name')
    nameInput && setValue(nameInput, 'Test')
    wrapper.vm.selectedCategoryId = 1
    await flushPromises()

    // Add employee via wrapper.vm (avoids fragile DOM event dispatching on child components)
    wrapper.vm.filterText = 'Mario'
    wrapper.vm.selectedSearchPerson = 'uuid-mario'
    wrapper.vm.selectedRole = 'Chef'
    wrapper.vm.addExistingPerson()
    await flushPromises()

    // Save
    const saveBtn = document.body.querySelector('.modal-footer .btn-primary')
    saveBtn?.click()
    await flushPromises()

    expect(api.createActivity).toHaveBeenCalledWith('Test', 1, 0)
    expect(api.updateActivity).toHaveBeenCalledWith(42, {
      employees: [{ employeeUuid: 'uuid-mario', role: 'Chef' }]
    })
  })

  it('shows pending employees list with remove button', async () => {
    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    // Verify search tab is showing
    const filterLabel = document.body.querySelector('label[for="emp-filter"]')
    expect(filterLabel).toBeTruthy()
    expect(filterLabel?.textContent).toContain('Filtra persone')

    // Initially no pending section
    expect(document.body.textContent).not.toContain('Rimuovi')

    // Add employee via wrapper.vm (reliable)
    wrapper.vm.pendingEmployees = [{
      employeeUuid: 'uuid-mario',
      role: 'Chef',
      name: 'Mario',
      surname: 'Rossi'
    }]
    await flushPromises()

    // Check pending employee is displayed
    expect(document.body.textContent).toContain('Mario')
    expect(document.body.textContent).toContain('Rossi')
    expect(document.body.textContent).toContain('Chef')
    const removeBtn = document.body.querySelector('.list-group-item .btn-outline-danger')
    expect(removeBtn).toBeTruthy()
    expect(removeBtn?.getAttribute('title')).toContain('Rimuovi')
  })

  it('removes employee from pending list when remove is clicked', async () => {
    // Add employees via wrapper.vm (reliable)
    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    // Directly set pending employees via component internals
    wrapper.vm.pendingEmployees = [{
      employeeUuid: 'uuid-mario',
      role: 'Chef',
      name: 'Mario',
      surname: 'Rossi'
    }]
    await flushPromises()

    expect(document.body.textContent).toContain('Mario')
    expect(document.body.querySelector('.list-group-item .btn-outline-danger')).toBeTruthy()

    // Click remove button
    document.body.querySelector('.list-group-item .btn-outline-danger')?.click()
    await flushPromises()

    // After removal, pending list should be empty (search results still show Mario)
    expect(wrapper.vm.pendingEmployees.length).toBe(0)
    expect(document.body.querySelector('.list-group-item .btn-outline-danger')).toBeFalsy()
  })

  it('prevents duplicate employees', async () => {
    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    // Add Mario once
    wrapper.vm.selectedSearchPerson = 'uuid-mario'
    wrapper.vm.selectedRole = 'Chef'
    wrapper.vm.addExistingPerson()
    await flushPromises()

    expect(wrapper.vm.pendingEmployees.length).toBe(1)

    // Try adding same person again
    wrapper.vm.addExistingPerson()
    await flushPromises()

    expect(wrapper.vm.pendingEmployees.length).toBe(1)
  })

  it('closes modal on close button click', async () => {
    const wrapper = mount(ActivityCreateModal, { attachTo: document.body })
    await flushPromises()

    document.body.querySelector('.btn-close')?.click()
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})

/*** Helper per simulare input utente su native input. */
function setValue(el, value) {
  el.value = value
  el.dispatchEvent(new Event('input', { bubbles: true }))
}
