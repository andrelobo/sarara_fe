import test from "node:test"
import assert from "node:assert/strict"

import { operationTargetsInventoryEntity } from "./db.js"

test("operationTargetsInventoryEntity matches explicit beverage queue operations", () => {
  assert.equal(
    operationTargetsInventoryEntity(
      { entity: "beverages", type: "update", entityId: "bev-1" },
      "beverages",
    ),
    true,
  )

  assert.equal(
    operationTargetsInventoryEntity(
      { entity: "beverages", type: "update", entityId: "bev-1" },
      "ingredients",
    ),
    false,
  )
})

test("operationTargetsInventoryEntity keeps legacy ingredient queue operations retryable", () => {
  assert.equal(
    operationTargetsInventoryEntity(
      { type: "delete", id: "ingredient-1" },
      "ingredients",
    ),
    true,
  )
})
