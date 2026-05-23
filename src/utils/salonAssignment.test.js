import test from "node:test"
import assert from "node:assert/strict"

import { getReferenceId, getReferenceLabel, requiresAssignedWaiter } from "./salonAssignment.js"

test("getReferenceId extracts ids from strings and populated documents", () => {
  assert.equal(getReferenceId("abc123"), "abc123")
  assert.equal(getReferenceId({ _id: "doc-1", username: "Andre" }), "doc-1")
  assert.equal(getReferenceId(null), "")
})

test("getReferenceLabel prefers human readable labels", () => {
  assert.equal(getReferenceLabel("raw-id"), "raw-id")
  assert.equal(getReferenceLabel({ _id: "u1", username: "Garcom 01" }), "Garcom 01")
  assert.equal(getReferenceLabel({ _id: "t1", number: 8 }), 8)
  assert.equal(getReferenceLabel(undefined), "Nao atribuido")
})

test("requiresAssignedWaiter only blocks admin assignment when active waiters exist and none is selected", () => {
  assert.equal(
    requiresAssignedWaiter({
      canAssignWaiter: true,
      waiterCount: 2,
      assignedWaiterId: "",
    }),
    true,
  )

  assert.equal(
    requiresAssignedWaiter({
      canAssignWaiter: true,
      waiterCount: 0,
      assignedWaiterId: "",
    }),
    false,
  )

  assert.equal(
    requiresAssignedWaiter({
      canAssignWaiter: true,
      waiterCount: 1,
      assignedWaiterId: { _id: "waiter-1", username: "Garcom" },
    }),
    false,
  )
})
