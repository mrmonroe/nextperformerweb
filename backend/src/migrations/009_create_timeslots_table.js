exports.up = function(knex) {
  return knex.schema.createTable('timeslots', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('event_id').notNullable()
    table.string('name', 100).notNullable() // e.g., "Slot 1", "Opening Act", "Headliner"
    table.text('description').nullable()
    table.time('start_time').notNullable()
    table.time('end_time').notNullable()
    table.integer('duration_minutes').notNullable() // Duration in minutes
    table.integer('max_performers').defaultTo(1) // How many performers can sign up
    table.boolean('is_available').defaultTo(true)
    table.integer('sort_order').defaultTo(0) // For ordering timeslots
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    
    // Foreign key constraint
    table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE')
    
    // Indexes
    table.index(['event_id'])
    table.index(['event_id', 'start_time'])
    table.index(['is_available'])
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('timeslots')
}
