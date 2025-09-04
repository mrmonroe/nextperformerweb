exports.up = function(knex) {
  return knex.schema.alterTable('performer_signups', function(table) {
    table.uuid('timeslot_id').nullable()
    table.foreign('timeslot_id').references('id').inTable('timeslots').onDelete('CASCADE')
    table.index(['timeslot_id'])
  })
}

exports.down = function(knex) {
  return knex.schema.alterTable('performer_signups', function(table) {
    table.dropForeign('timeslot_id')
    table.dropIndex(['timeslot_id'])
    table.dropColumn('timeslot_id')
  })
}
