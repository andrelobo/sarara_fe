import {
  COMMANDS_STORE,
  SALON_QUEUE_STORE,
  TABLES_STORE,
  deleteData,
  getAllData,
  getDataById,
  getSalonQueue,
  saveData,
  saveSalonQueue,
  updateSalonQueueItem,
} from "./db.js"
import { getReferenceId } from "./salonAssignment.js"

const TEMP_PREFIX = "local"

export function generateSalonTempId(entity) {
  return `${TEMP_PREFIX}_${entity}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function buildPendingSyncMetadata(existingMetadata = {}) {
  return {
    ...existingMetadata,
    offline: true,
    pendingSync: true,
    state: "pending",
    lastError: null,
    failedAt: null,
  }
}

function buildEntitySyncIdentifiers(entity) {
  return new Set([entity?._id, entity?.syncMetadata?.serverId].filter(Boolean))
}

function buildCommandItemSyncIdentifiers(item) {
  return new Set([item?._id, item?.syncMetadata?.serverId].filter(Boolean))
}

export function operationTargetsSalonEntity(operation, entityType, entityIdsInput) {
  const entityIds = entityIdsInput instanceof Set ? entityIdsInput : new Set(entityIdsInput || [])
  const payload = operation?.payload || {}

  if (entityIds.size === 0) {
    return false
  }

  if (entityType === "table") {
    return [payload.localTableId, payload.tableId].some((value) => entityIds.has(value))
  }

  if (entityType === "command") {
    return [payload.localCommandId, payload.commandId].some((value) => entityIds.has(value))
  }

  return false
}

export function operationTargetsSalonCommandItem(operation, commandIdsInput, itemIdsInput) {
  const commandIds = commandIdsInput instanceof Set ? commandIdsInput : new Set(commandIdsInput || [])
  const itemIds = itemIdsInput instanceof Set ? itemIdsInput : new Set(itemIdsInput || [])
  const payload = operation?.payload || {}

  if (commandIds.size === 0 || itemIds.size === 0) {
    return false
  }

  if (!["command_add_item", "command_update_item"].includes(operation?.action)) {
    return false
  }

  const matchesCommand = [payload.localCommandId, payload.commandId].some((value) => commandIds.has(value))
  const matchesItem = [payload.localItemId, payload.itemId].some((value) => itemIds.has(value))

  return matchesCommand && matchesItem
}

function buildFailedSyncMetadata(existingMetadata = {}, error) {
  return {
    ...existingMetadata,
    offline: true,
    pendingSync: true,
    state: "failed",
    lastError: error?.message || String(error),
    failedAt: new Date().toISOString(),
  }
}

function buildSyncedSyncMetadata(existingMetadata = {}, serverId = null) {
  return {
    ...existingMetadata,
    offline: false,
    pendingSync: false,
    state: "synced",
    serverId: serverId || existingMetadata.serverId || null,
    syncedAt: new Date().toISOString(),
    lastError: null,
    failedAt: null,
  }
}

export function getSalonSyncStatus(entity) {
  const syncMetadata = entity?.syncMetadata || {}

  if (syncMetadata.lastError || syncMetadata.state === "failed") {
    return {
      key: "failed",
      label: "Falha sync",
      tone: "danger",
      description: syncMetadata.lastError || "A sincronizacao precisa de revisao antes de reenviar.",
      timestamp: syncMetadata.failedAt || null,
    }
  }

  if (entity?.localOnly) {
    return {
      key: "local",
      label: "Somente local",
      tone: "offline",
      description: "Registro criado neste dispositivo e ainda nao enviado ao servidor.",
      timestamp: entity?.createdAt || null,
    }
  }

  if (entity?.pendingSync || syncMetadata.pendingSync || syncMetadata.state === "pending") {
    return {
      key: "pending",
      label: "Pendente",
      tone: "warning",
      description: "Alteracoes locais aguardando sincronizacao com o servidor.",
      timestamp: entity?.updatedAt || entity?.createdAt || null,
    }
  }

  if (syncMetadata.syncedAt) {
    return {
      key: "synced",
      label: "Sincronizado",
      tone: "success",
      description: "Ultima sincronizacao concluida com sucesso.",
      timestamp: syncMetadata.syncedAt,
    }
  }

  return {
    key: "live",
    label: "Ao vivo",
    tone: "neutral",
    description: "Dados carregados diretamente do servidor.",
    timestamp: entity?.updatedAt || entity?.createdAt || null,
  }
}

export function sortTablesByNumber(tables) {
  return [...(Array.isArray(tables) ? tables : [])].sort((left, right) => {
    const leftNumber = Number(left?.number || 0)
    const rightNumber = Number(right?.number || 0)
    return leftNumber - rightNumber
  })
}

export function resolveOfflineWaiterId({ currentUser, assignedWaiterId, existingWaiterId = null }) {
  if (currentUser?.role === "waiter") {
    return currentUser._id
  }

  return getReferenceId(assignedWaiterId) || getReferenceId(existingWaiterId) || null
}

export function recalculateOfflineCommandTotals(command) {
  const items = Array.isArray(command?.items) ? command.items : []
  const subtotal = items.reduce((sum, item) => {
    if (item.status === "cancelled") {
      return sum
    }

    return sum + Number(item.quantity || 0) * Number(item.unitPrice || 0)
  }, 0)

  return {
    ...command,
    subtotal,
    total: subtotal + Number(command?.serviceTax || 0),
  }
}

function normalizeOfflinePaymentRecord(payment, fallbackUserId, fallbackPaidAt) {
  return {
    method: typeof payment?.method === "string" ? payment.method.trim().toLowerCase() : "cash",
    amount: Number(payment?.amount || 0),
    paidAt: payment?.paidAt || fallbackPaidAt,
    receivedBy: payment?.receivedBy || fallbackUserId || null,
    machineLabel: typeof payment?.machineLabel === "string" ? payment.machineLabel.trim() : "",
    referenceCode: typeof payment?.referenceCode === "string" ? payment.referenceCode.trim() : "",
    notes: typeof payment?.notes === "string" ? payment.notes.trim() : "",
  }
}

export function createOfflineTableRecord({ number, name, currentUser }) {
  const now = new Date().toISOString()
  return {
    _id: generateSalonTempId("table"),
    number,
    name: typeof name === "string" && name.trim() ? name.trim() : `Mesa ${number}`,
    status: "free",
    openedAt: null,
    closedAt: null,
    currentCommandId: null,
    waiterId: null,
    deletedAt: null,
    auditTrail: [],
    localOnly: true,
    pendingSync: true,
    syncMetadata: buildPendingSyncMetadata(),
    createdAt: now,
    updatedAt: now,
    localMeta: {
      lastAction: "table_created",
      actorUserId: currentUser?._id || null,
    },
  }
}

export function openOfflineTableRecord(table, { currentUser, assignedWaiterId }) {
  const now = new Date().toISOString()
  return {
    ...table,
    status: "occupied",
    openedAt: table?.openedAt || now,
    closedAt: null,
    waiterId: resolveOfflineWaiterId({
      currentUser,
      assignedWaiterId,
      existingWaiterId: table?.waiterId,
    }),
    pendingSync: true,
    syncMetadata: buildPendingSyncMetadata(table?.syncMetadata),
    updatedAt: now,
    localMeta: {
      ...(table?.localMeta || {}),
      lastAction: "table_opened",
      actorUserId: currentUser?._id || null,
    },
  }
}

export function closeOfflineTableRecord(table, { currentUser }) {
  const now = new Date().toISOString()
  return {
    ...table,
    status: "free",
    closedAt: now,
    waiterId: null,
    currentCommandId: null,
    pendingSync: true,
    syncMetadata: buildPendingSyncMetadata(table?.syncMetadata),
    updatedAt: now,
    localMeta: {
      ...(table?.localMeta || {}),
      lastAction: "table_closed",
      actorUserId: currentUser?._id || null,
    },
  }
}

export function createOfflineCommandRecord({ tableId, serviceTax = 0, currentUser, assignedWaiterId }) {
  const now = new Date().toISOString()
  return recalculateOfflineCommandTotals({
    _id: generateSalonTempId("command"),
    tableId,
    waiterId: resolveOfflineWaiterId({
      currentUser,
      assignedWaiterId,
    }),
    status: "open",
    items: [],
    subtotal: 0,
    serviceTax: Number(serviceTax || 0),
    total: Number(serviceTax || 0),
    openedAt: now,
    closedAt: null,
    payments: [],
    syncMetadata: buildPendingSyncMetadata(),
    auditTrail: [],
    localOnly: true,
    pendingSync: true,
    createdAt: now,
    updatedAt: now,
    localMeta: {
      lastAction: "command_created",
      actorUserId: currentUser?._id || null,
    },
  })
}

export function attachCommandToOfflineTable(table, command) {
  return {
    ...table,
    status: "occupied",
    currentCommandId: command._id,
    waiterId: command.waiterId || table?.waiterId || null,
    pendingSync: true,
    syncMetadata: buildPendingSyncMetadata(table?.syncMetadata),
    updatedAt: new Date().toISOString(),
  }
}

export function addOfflineCommandItemRecord(command, payload, currentUser) {
  const now = new Date().toISOString()
  const nextCommand = {
    ...command,
    items: [
      ...(Array.isArray(command?.items) ? command.items : []),
      {
        _id: generateSalonTempId("command_item"),
        productType: payload.productType || "manual",
        productId: payload.productId || null,
        nameSnapshot: payload.nameSnapshot,
        quantity: Number(payload.quantity || 0),
        unitPrice: Number(payload.unitPrice || 0),
        notes: payload.notes || "",
        status: "pending",
        createdAt: now,
        localOnly: true,
        pendingSync: true,
        syncMetadata: buildPendingSyncMetadata(),
      },
    ],
    pendingSync: true,
    syncMetadata: buildPendingSyncMetadata(command?.syncMetadata),
    updatedAt: now,
    localMeta: {
      ...(command?.localMeta || {}),
      lastAction: "command_item_added",
      actorUserId: currentUser?._id || null,
    },
  }

  return recalculateOfflineCommandTotals(nextCommand)
}

export function updateOfflineCommandItemRecord(command, itemId, updates, currentUser) {
  const items = (Array.isArray(command?.items) ? command.items : []).map((item) =>
    item._id === itemId
      ? {
          ...item,
          ...updates,
          pendingSync: true,
          syncMetadata: buildPendingSyncMetadata(item?.syncMetadata),
        }
      : item,
  )

  return recalculateOfflineCommandTotals({
    ...command,
    items,
    pendingSync: true,
    syncMetadata: buildPendingSyncMetadata(command?.syncMetadata),
    updatedAt: new Date().toISOString(),
    localMeta: {
      ...(command?.localMeta || {}),
      lastAction: "command_item_updated",
      actorUserId: currentUser?._id || null,
    },
  })
}

export function finalizeOfflineCommandRecord(command, action, currentUser, options = {}) {
  const closedAt = new Date().toISOString()
  const nextStatus = action === "cancel" ? "cancelled" : "closed"
  const normalizedPayments =
    action === "close"
      ? (Array.isArray(options.payments) ? options.payments : []).map((payment) =>
          normalizeOfflinePaymentRecord(payment, currentUser?._id || null, closedAt),
        )
      : []
  const nextItems =
    action === "cancel"
      ? (Array.isArray(command?.items) ? command.items : []).map((item) => ({
          ...item,
          status: "cancelled",
          pendingSync: true,
          syncMetadata: buildPendingSyncMetadata(item?.syncMetadata),
        }))
      : Array.isArray(command?.items)
        ? command.items
        : []

  return recalculateOfflineCommandTotals({
    ...command,
    items: nextItems,
    status: nextStatus,
    closedAt,
    payments: normalizedPayments,
    pendingSync: true,
    syncMetadata: buildPendingSyncMetadata(command?.syncMetadata),
    updatedAt: closedAt,
    localMeta: {
      ...(command?.localMeta || {}),
      lastAction: action === "cancel" ? "command_cancelled" : "command_closed",
      actorUserId: currentUser?._id || null,
    },
  })
}

export async function getOfflineTables() {
  return sortTablesByNumber(await getAllData(TABLES_STORE))
}

export async function getOfflineTable(id) {
  return getDataById(TABLES_STORE, id)
}

export async function saveOfflineTables(tables) {
  return saveData(TABLES_STORE, sortTablesByNumber(tables))
}

export async function saveOfflineTable(table) {
  return saveData(TABLES_STORE, table)
}

export async function getOfflineCommand(id) {
  return getDataById(COMMANDS_STORE, id)
}

export async function saveOfflineCommand(command) {
  return saveData(COMMANDS_STORE, command)
}

export async function saveOfflineCommands(commands) {
  return saveData(COMMANDS_STORE, commands)
}

export async function queueSalonOperation(action, payload) {
  return saveSalonQueue({
    kind: "salon",
    action,
    payload,
  })
}

export async function retrySalonEntityOperations(entityType, entity) {
  const entityIds = buildEntitySyncIdentifiers(entity)
  const operations = await getAllData(SALON_QUEUE_STORE)
  const failedOperations = operations.filter(
    (operation) => operation.status === "failed" && operationTargetsSalonEntity(operation, entityType, entityIds),
  )

  if (failedOperations.length === 0) {
    return { retried: 0 }
  }

  for (const operation of failedOperations) {
    await updateSalonQueueItem(operation.id, {
      status: "pending",
      error: null,
      lastAttempt: null,
    })
  }

  const syncMetadata = buildPendingSyncMetadata(entity?.syncMetadata)

  if (entityType === "table") {
    await saveOfflineTable({
      ...entity,
      pendingSync: true,
      syncMetadata,
      updatedAt: new Date().toISOString(),
    })
  }

  if (entityType === "command") {
    await saveOfflineCommand({
      ...entity,
      pendingSync: true,
      syncMetadata,
      updatedAt: new Date().toISOString(),
    })
  }

  return { retried: failedOperations.length }
}

export async function retrySalonCommandItemOperations(command, item) {
  const commandIds = buildEntitySyncIdentifiers(command)
  const itemIds = buildCommandItemSyncIdentifiers(item)
  const operations = await getAllData(SALON_QUEUE_STORE)
  const failedOperations = operations.filter(
    (operation) => operation.status === "failed" && operationTargetsSalonCommandItem(operation, commandIds, itemIds),
  )

  if (failedOperations.length === 0) {
    return { retried: 0 }
  }

  for (const operation of failedOperations) {
    await updateSalonQueueItem(operation.id, {
      status: "pending",
      error: null,
      lastAttempt: null,
    })
  }

  const nextItems = (Array.isArray(command?.items) ? command.items : []).map((currentItem) =>
    currentItem._id === item._id
      ? {
          ...currentItem,
          pendingSync: true,
          syncMetadata: buildPendingSyncMetadata(currentItem?.syncMetadata),
        }
      : currentItem,
  )

  await saveOfflineCommand({
    ...command,
    items: nextItems,
    pendingSync: true,
    syncMetadata: buildPendingSyncMetadata(command?.syncMetadata),
    updatedAt: new Date().toISOString(),
  })

  return { retried: failedOperations.length }
}

function applyReferenceMapping(value, mapping) {
  if (!value) {
    return value
  }

  return mapping.get(value) || value
}

async function replacePendingQueueReferences({
  tableMapping = new Map(),
  commandMapping = new Map(),
  itemMapping = new Map(),
}) {
  const queue = await getSalonQueue()

  for (const operation of queue) {
    const payload = { ...(operation.payload || {}) }

    if (payload.localTableId) {
      payload.localTableId = applyReferenceMapping(payload.localTableId, tableMapping)
    }

    if (payload.tableId) {
      payload.tableId = applyReferenceMapping(payload.tableId, tableMapping)
    }

    if (payload.localCommandId) {
      payload.localCommandId = applyReferenceMapping(payload.localCommandId, commandMapping)
    }

    if (payload.commandId) {
      payload.commandId = applyReferenceMapping(payload.commandId, commandMapping)
    }

    if (payload.localItemId) {
      payload.localItemId = applyReferenceMapping(payload.localItemId, itemMapping)
    }

    if (payload.itemId) {
      payload.itemId = applyReferenceMapping(payload.itemId, itemMapping)
    }

    await updateSalonQueueItem(operation.id, { payload })
  }
}

async function markSalonOperationComplete(id) {
  await updateSalonQueueItem(id, {
    status: "completed",
    syncedAt: new Date().toISOString(),
  })
}

async function markSalonOperationFailed(id, error) {
  await updateSalonQueueItem(id, {
    status: "failed",
    error: error?.message || String(error),
    lastAttempt: new Date().toISOString(),
  })
}

async function markOfflineTableSyncFailure(localTableId, error) {
  if (!localTableId) {
    return
  }

  const offlineTable = await getOfflineTable(localTableId)
  if (!offlineTable) {
    return
  }

  await saveOfflineTable({
    ...offlineTable,
    pendingSync: true,
    updatedAt: new Date().toISOString(),
    syncMetadata: buildFailedSyncMetadata(offlineTable.syncMetadata, error),
  })
}

async function markOfflineCommandSyncFailure(localCommandId, error, localItemId = null) {
  if (!localCommandId) {
    return
  }

  const offlineCommand = await getOfflineCommand(localCommandId)
  if (!offlineCommand) {
    return
  }

  const items = !localItemId
    ? offlineCommand.items
    : (Array.isArray(offlineCommand.items) ? offlineCommand.items : []).map((item) =>
        item._id === localItemId
          ? {
              ...item,
              pendingSync: true,
              syncMetadata: buildFailedSyncMetadata(item?.syncMetadata, error),
            }
          : item,
      )

  await saveOfflineCommand({
    ...offlineCommand,
    items,
    pendingSync: true,
    updatedAt: new Date().toISOString(),
    syncMetadata: buildFailedSyncMetadata(offlineCommand.syncMetadata, error),
  })
}

async function markSalonRecordSyncFailure(operation, mappings, error) {
  const payload = operation.payload || {}

  switch (operation.action) {
    case "table_create":
      await markOfflineTableSyncFailure(payload.localTableId, error)
      return

    case "table_open":
    case "table_close": {
      const { localId } = await resolveOfflineTableForSync(payload.localTableId, mappings.table)
      await markOfflineTableSyncFailure(localId, error)
      return
    }

    case "command_create":
      await markOfflineCommandSyncFailure(payload.localCommandId, error)
      return

    case "command_add_item": {
      const { localId } = await resolveOfflineCommandForSync(payload.localCommandId, mappings.command)
      await markOfflineCommandSyncFailure(localId, error, payload.localItemId)
      return
    }

    case "command_update_item": {
      const { localId } = await resolveOfflineCommandForSync(payload.localCommandId, mappings.command)
      await markOfflineCommandSyncFailure(localId, error, payload.itemId)
      return
    }

    case "command_close":
    case "command_cancel": {
      const { localId } = await resolveOfflineCommandForSync(payload.localCommandId, mappings.command)
      await markOfflineCommandSyncFailure(localId, error)
      return
    }

    default:
      return
  }
}

async function replaceOfflineTableAfterSync(localTableId, serverTable) {
  const normalizedTable = {
    ...serverTable,
    localOnly: false,
    pendingSync: false,
    syncMetadata: buildSyncedSyncMetadata(serverTable.syncMetadata, serverTable._id),
  }

  if (localTableId && localTableId !== serverTable._id) {
    await deleteData(TABLES_STORE, localTableId)
  }

  await saveOfflineTable(normalizedTable)
  return normalizedTable
}

async function replaceOfflineCommandAfterSync(localCommandId, serverCommand) {
  const normalizedCommand = {
    ...serverCommand,
    localOnly: false,
    pendingSync: false,
    syncMetadata: buildSyncedSyncMetadata(serverCommand.syncMetadata, serverCommand._id),
  }

  if (localCommandId && localCommandId !== serverCommand._id) {
    await deleteData(COMMANDS_STORE, localCommandId)
  }

  await saveOfflineCommand(normalizedCommand)
  return normalizedCommand
}

async function updateOfflineCommandsTableReference(localTableId, serverTableId) {
  const commands = await getAllData(COMMANDS_STORE)
  const updatedCommands = commands.map((command) =>
    command.tableId === localTableId
      ? {
          ...command,
          tableId: serverTableId,
        }
      : command,
  )

  await saveOfflineCommands(updatedCommands)
}

async function resolveOfflineTableForSync(tableId, tableMap = new Map()) {
  const mappedId = applyReferenceMapping(tableId, tableMap)
  const directRecord = await getOfflineTable(mappedId)

  if (directRecord) {
    return { localId: mappedId, record: directRecord }
  }

  const tables = await getOfflineTables()
  const matched = tables.find((table) => table?.syncMetadata?.serverId === mappedId)

  return {
    localId: matched?._id || mappedId,
    record: matched || null,
  }
}

async function resolveOfflineCommandForSync(commandId, commandMap = new Map()) {
  const mappedId = applyReferenceMapping(commandId, commandMap)
  const directRecord = await getOfflineCommand(mappedId)

  if (directRecord) {
    return { localId: mappedId, record: directRecord }
  }

  const commands = await getAllData(COMMANDS_STORE)
  const matched = commands.find((command) => command?.syncMetadata?.serverId === mappedId)

  return {
    localId: matched?._id || mappedId,
    record: matched || null,
  }
}

function resolveServerId(record, fallbackId, idMap = new Map()) {
  const mappedId = applyReferenceMapping(fallbackId, idMap)

  if (record?.syncMetadata?.serverId) {
    return record.syncMetadata.serverId
  }

  return mappedId
}

async function syncSingleSalonOperation(operation, apiBaseUrl, headers, mappings) {
  const payload = operation.payload || {}

  switch (operation.action) {
    case "table_create": {
      const { localTableId, number, name } = payload
      const response = await fetch(`${apiBaseUrl}/tables`, {
        method: "POST",
        headers,
        body: JSON.stringify({ number, name }),
      })

      const serverTable = await response.json()
      if (!response.ok) {
        throw new Error(serverTable.error || serverTable.message || "Nao foi possivel sincronizar a mesa")
      }

      await replaceOfflineTableAfterSync(localTableId, serverTable)
      mappings.table.set(localTableId, serverTable._id)
      await updateOfflineCommandsTableReference(localTableId, serverTable._id)
      await replacePendingQueueReferences({ tableMapping: new Map([[localTableId, serverTable._id]]) })
      return { action: operation.action, entityId: serverTable._id }
    }

    case "table_open":
    case "table_close": {
      const { localTableId, waiterId } = payload
      const { localId, record } = await resolveOfflineTableForSync(localTableId, mappings.table)
      const serverTableId = resolveServerId(record, localTableId, mappings.table)
      const action = operation.action === "table_open" ? "open" : "close"
      const response = await fetch(`${apiBaseUrl}/tables/${serverTableId}/${action}`, {
        method: "POST",
        headers,
        body:
          action === "open" && waiterId
            ? JSON.stringify({
                waiterId,
              })
            : undefined,
      })

      const serverTable = await response.json()
      if (!response.ok) {
        throw new Error(serverTable.error || serverTable.message || "Nao foi possivel sincronizar a operacao da mesa")
      }

      await replaceOfflineTableAfterSync(localId, serverTable)
      return { action: operation.action, entityId: serverTable._id }
    }

    case "command_create": {
      const { localCommandId, tableId, waiterId, serviceTax } = payload
      const { record: tableRecord } = await resolveOfflineTableForSync(tableId, mappings.table)
      const serverTableId = resolveServerId(tableRecord, tableId, mappings.table)
      const response = await fetch(`${apiBaseUrl}/commands`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          tableId: serverTableId,
          waiterId,
          serviceTax,
        }),
      })

      const serverCommand = await response.json()
      if (!response.ok) {
        throw new Error(serverCommand.error || serverCommand.message || "Nao foi possivel sincronizar a comanda")
      }

      await replaceOfflineCommandAfterSync(localCommandId, serverCommand)
      mappings.command.set(localCommandId, serverCommand._id)
      await replacePendingQueueReferences({ commandMapping: new Map([[localCommandId, serverCommand._id]]) })

      const { localId: tableLocalId, record: offlineTable } = await resolveOfflineTableForSync(tableId, mappings.table)
      if (offlineTable) {
        await replaceOfflineTableAfterSync(tableLocalId, {
          ...offlineTable,
          _id: resolveServerId(offlineTable, tableId, mappings.table),
          currentCommandId: serverCommand._id,
          waiterId: serverCommand.waiterId,
          status: "occupied",
          pendingSync: false,
        })
      }

      return { action: operation.action, entityId: serverCommand._id }
    }

    case "command_add_item": {
      const { localCommandId, localItemId, payload: itemPayload } = payload
      const { localId, record } = await resolveOfflineCommandForSync(localCommandId, mappings.command)
      const serverCommandId = resolveServerId(record, localCommandId, mappings.command)
      const response = await fetch(`${apiBaseUrl}/commands/${serverCommandId}/items`, {
        method: "POST",
        headers,
        body: JSON.stringify(itemPayload),
      })

      const updatedCommand = await response.json()
      if (!response.ok) {
        throw new Error(updatedCommand.error || updatedCommand.message || "Nao foi possivel sincronizar o item da comanda")
      }

      await replaceOfflineCommandAfterSync(localId, updatedCommand)

      const addedServerItem = updatedCommand.items?.[updatedCommand.items.length - 1]
      if (localItemId && addedServerItem?._id) {
        mappings.item.set(localItemId, addedServerItem._id)
        await replacePendingQueueReferences({ itemMapping: new Map([[localItemId, addedServerItem._id]]) })
      }

      return { action: operation.action, entityId: updatedCommand._id }
    }

    case "command_update_item": {
      const { localCommandId, itemId, updates } = payload
      const { localId, record } = await resolveOfflineCommandForSync(localCommandId, mappings.command)
      const serverCommandId = resolveServerId(record, localCommandId, mappings.command)
      const serverItemId = applyReferenceMapping(itemId, mappings.item)
      const response = await fetch(`${apiBaseUrl}/commands/${serverCommandId}/items/${serverItemId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updates),
      })

      const updatedCommand = await response.json()
      if (!response.ok) {
        throw new Error(updatedCommand.error || updatedCommand.message || "Nao foi possivel sincronizar a atualizacao do item")
      }

      await replaceOfflineCommandAfterSync(localId, updatedCommand)
      return { action: operation.action, entityId: updatedCommand._id }
    }

    case "command_close":
    case "command_cancel": {
      const { localCommandId, tableId, payments = [] } = payload
      const { localId, record } = await resolveOfflineCommandForSync(localCommandId, mappings.command)
      const serverCommandId = resolveServerId(record, localCommandId, mappings.command)
      const response = await fetch(
        `${apiBaseUrl}/commands/${serverCommandId}/${operation.action === "command_close" ? "close" : "cancel"}`,
        {
          method: "POST",
          headers,
          body: operation.action === "command_close" ? JSON.stringify({ payments }) : undefined,
        },
      )

      const updatedCommand = await response.json()
      if (!response.ok) {
        throw new Error(updatedCommand.error || updatedCommand.message || "Nao foi possivel sincronizar o fechamento da comanda")
      }

      await replaceOfflineCommandAfterSync(localId, updatedCommand)

      const { localId: tableLocalId, record: offlineTable } = await resolveOfflineTableForSync(tableId, mappings.table)
      if (offlineTable) {
        await replaceOfflineTableAfterSync(tableLocalId, {
          ...offlineTable,
          _id: resolveServerId(offlineTable, tableId, mappings.table),
          status: "free",
          currentCommandId: null,
          waiterId: null,
          pendingSync: false,
        })
      }

      return { action: operation.action, entityId: updatedCommand._id }
    }

    default:
      throw new Error(`Acao offline do Salon nao suportada: ${operation.action}`)
  }
}

export async function syncSalonQueue(apiBaseUrl, headers) {
  const pendingOperations = (await getSalonQueue()).sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  )

  if (pendingOperations.length === 0) {
    return {
      success: true,
      message: "Nada para sincronizar no Salon",
      results: [],
    }
  }

  const results = []
  const mappings = {
    table: new Map(),
    command: new Map(),
    item: new Map(),
  }

  for (const operation of pendingOperations) {
    try {
      const result = await syncSingleSalonOperation(operation, apiBaseUrl, headers, mappings)
      await markSalonOperationComplete(operation.id)
      results.push({ success: true, operation, result })
    } catch (error) {
      console.error("Erro ao sincronizar operacao do Salon:", error)
      await markSalonRecordSyncFailure(operation, mappings, error)
      await markSalonOperationFailed(operation.id, error)
      results.push({ success: false, operation, error })
    }
  }

  const successful = results.filter((result) => result.success).length
  const failed = results.length - successful

  return {
    success: failed === 0,
    message: `Salon sincronizado: ${successful} sucesso, ${failed} falhas`,
    results,
  }
}
