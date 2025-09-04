/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('timeslots', function(table) {
    // Ensure all timeslots have max_performers set to 1
    return knex('timeslots')
      .whereNull('max_performers')
      .orWhere('max_performers', '>', 1)
      .update({ max_performers: 1 })
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // No rollback needed as this is a data correction
  return Promise.resolve()
}
