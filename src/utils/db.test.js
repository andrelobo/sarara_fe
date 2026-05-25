import test from "node:test"
import assert from "node:assert/strict"

import { operationTargetsInventoryEntity, operationTargetsInventoryItem } from "./db.js"

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

test("operationTargetsInventoryItem matches inventory operations by entityId and localEntityId", () => {
  const entityIds = new Set(["bev-1", "temp-bev-1"])

  assert.equal(
    operationTargetsInventoryItem(
      { entity: "beverages", type: "update", entityId: "bev-1" },
      "beverages",
      entityIds,
    ),
    true,
  )

  assert.equal(
    operationTargetsInventoryItem(
      { entity: "beverages", type: "create", localEntityId: "temp-bev-1" },
      "beverages",
      entityIds,
    ),
    true,
  )

  assert.equal(
    operationTargetsInventoryItem(
      { entity: "beverages", type: "update", entityId: "bev-2" },
      "beverages",
      entityIds,
    ),
    false,
  )
})
