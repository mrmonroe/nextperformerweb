exports.up = function(knex) {
  return knex.schema.createTable('configurations', function(table) {
    table.increments('id').primary()
    table.string('key').notNullable().unique()
    table.json('value').notNullable()
    table.text('description').nullable()
    table.string('category').notNullable().defaultTo('general')
    table.boolean('is_public').defaultTo(false) // Whether this config is accessible without auth
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    
    table.index(['category', 'is_public'])
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('configurations')
}
