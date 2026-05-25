import test from "node:test"
import assert from "node:assert/strict"

import {
  addOfflineCommandItemRecord,
  attachCommandToOfflineTable,
  createOfflineCommandRecord,
  createOfflineTableRecord,
  finalizeOfflineCommandRecord,
  getSalonSyncStatus,
  openOfflineTableRecord,
  operationTargetsSalonCommandItem,
  operationTargetsSalonEntity,
  recalculateOfflineCommandTotals,
  resolveOfflineWaiterId,
} from "./salonOffline.js"

test("resolveOfflineWaiterId keeps waiter-owned operations on the logged user", () => {
  assert.equal(
    resolveOfflineWaiterId({
      currentUser: { _id: "waiter-self", role: "waiter" },
      assignedWaiterId: "waiter-other",
      existingWaiterId: "waiter-table",
    }),
    "waiter-self",
  )
})

test("openOfflineTableRecord assigns the chosen waiter and moves the table to occupied", () => {
  const table = createOfflineTableRecord({ number: 7, name: "Deck", currentUser: { _id: "admin-1" } })
  const opened = openOfflineTableRecord(table, {
    currentUser: { _id: "admin-1", role: "admin" },
    assignedWaiterId: "waiter-9",
  })

  assert.equal(opened.status, "occupied")
  assert.equal(opened.waiterId, "waiter-9")
})

test("createOfflineCommandRecord and attachCommandToOfflineTable keep the same waiter ownership", () => {
  const table = createOfflineTableRecord({ number: 3, name: "Sala 3", currentUser: { _id: "admin-1" } })
  const command = createOfflineCommandRecord({
    tableId: table._id,
    serviceTax: 15,
    currentUser: { _id: "admin-1", role: "admin" },
    assignedWaiterId: "waiter-4",
  })
  const attachedTable = attachCommandToOfflineTable(table, command)

  assert.equal(command.waiterId, "waiter-4")
  assert.equal(attachedTable.currentCommandId, command._id)
  assert.equal(attachedTable.waiterId, "waiter-4")
})

test("offline command items recalculate totals and cancelled commands zero the commercial total", () => {
  const command = createOfflineCommandRecord({
    tableId: "table-1",
    serviceTax: 10,
    currentUser: { _id: "waiter-1", role: "waiter" },
    assignedWaiterId: "",
  })

  const withItems = addOfflineCommandItemRecord(
    addOfflineCommandItemRecord(
      command,
      { nameSnapshot: "Negroni", quantity: 2, unitPrice: 18, notes: "", productType: "manual", productId: null },
      { _id: "waiter-1" },
    ),
    { nameSnapshot: "Spritz", quantity: 1, unitPrice: 22, notes: "", productType: "manual", productId: null },
    { _id: "waiter-1" },
  )

  assert.equal(withItems.subtotal, 58)
  assert.equal(withItems.total, 68)

  const cancelled = finalizeOfflineCommandRecord(withItems, "cancel", { _id: "waiter-1" })
  const normalizedCancelled = recalculateOfflineCommandTotals(cancelled)

  assert.equal(normalizedCancelled.status, "cancelled")
  assert.equal(normalizedCancelled.subtotal, 0)
  assert.equal(normalizedCancelled.total, 10)
})

test("finalizeOfflineCommandRecord keeps structured payments when closing a command", () => {
  const command = addOfflineCommandItemRecord(
    createOfflineCommandRecord({
      tableId: "table-9",
      serviceTax: 0,
      currentUser: { _id: "waiter-2", role: "waiter" },
      assignedWaiterId: "",
    }),
    { nameSnapshot: "Gin Tonic", quantity: 2, unitPrice: 21, notes: "", productType: "manual", productId: null },
    { _id: "waiter-2" },
  )

  const closed = finalizeOfflineCommandRecord(command, "close", { _id: "waiter-2" }, {
    payments: [
      {
        method: "pix",
        amount: 42,
        referenceCode: "pix-42",
      },
    ],
  })

  assert.equal(closed.status, "closed")
  assert.equal(closed.payments.length, 1)
  assert.equal(closed.payments[0].method, "pix")
  assert.equal(closed.payments[0].amount, 42)
  assert.equal(closed.payments[0].receivedBy, "waiter-2")
})

test("getSalonSyncStatus exposes local pending records clearly for the UI", () => {
  const offlineTable = createOfflineTableRecord({ number: 12, name: "Varanda", currentUser: { _id: "admin-1" } })
  const syncStatus = getSalonSyncStatus(offlineTable)

  assert.equal(syncStatus.key, "local")
  assert.equal(syncStatus.label, "Somente local")
  assert.equal(syncStatus.tone, "offline")
})

test("getSalonSyncStatus prioritizes sync failures over generic pending state", () => {
  const syncStatus = getSalonSyncStatus({
    pendingSync: true,
    syncMetadata: {
      state: "failed",
      lastError: "Mesa rejeitada pelo servidor",
    },
  })

  assert.equal(syncStatus.key, "failed")
  assert.equal(syncStatus.label, "Falha sync")
  assert.match(syncStatus.description, /servidor/i)
})

test("operationTargetsSalonEntity matches failed queue entries to the right table and command", () => {
  const tableIds = new Set(["table-local-1", "table-server-1"])
  const commandIds = new Set(["command-local-1", "command-server-1"])

  assert.equal(
    operationTargetsSalonEntity(
      { payload: { localTableId: "table-local-1" } },
      "table",
      tableIds,
    ),
    true,
  )

  assert.equal(
    operationTargetsSalonEntity(
      { payload: { localCommandId: "command-local-1" } },
      "command",
      commandIds,
    ),
    true,
  )

  assert.equal(
    operationTargetsSalonEntity(
      { payload: { localCommandId: "command-other" } },
      "command",
      commandIds,
    ),
    false,
  )
})

test("operationTargetsSalonCommandItem matches only the intended failed command item operation", () => {
  const commandIds = new Set(["command-local-1", "command-server-1"])
  const itemIds = new Set(["item-local-1", "item-server-1"])

  assert.equal(
    operationTargetsSalonCommandItem(
      { action: "command_add_item", payload: { localCommandId: "command-local-1", localItemId: "item-local-1" } },
      commandIds,
      itemIds,
    ),
    true,
  )

  assert.equal(
    operationTargetsSalonCommandItem(
      { action: "command_update_item", payload: { commandId: "command-server-1", itemId: "item-server-1" } },
      commandIds,
      itemIds,
    ),
    true,
  )

  assert.equal(
    operationTargetsSalonCommandItem(
      { action: "command_close", payload: { localCommandId: "command-local-1", localItemId: "item-local-1" } },
      commandIds,
      itemIds,
    ),
    false,
  )
})
