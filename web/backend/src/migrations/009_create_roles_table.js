exports.up = function(knex) {
  return knex.schema.createTable('roles', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('name').notNull().unique()
    table.string('display_name').notNull()
    table.text('description')
    table.json('permissions').notNull().defaultTo('[]')
    table.boolean('is_active').defaultTo(true)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('roles')
}
