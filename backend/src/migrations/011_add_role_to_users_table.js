exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.uuid('primary_role_id').nullable()
    table.foreign('primary_role_id').references('id').inTable('roles').onDelete('SET NULL')
  })
}

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropForeign('primary_role_id')
    table.dropColumn('primary_role_id')
  })
}
