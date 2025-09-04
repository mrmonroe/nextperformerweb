exports.up = function(knex) {
  return knex.schema.createTable('performer_signups', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('event_id').notNullable()
    table.string('performer_name', 100).notNullable()
    table.string('email', 255).notNullable()
    table.string('phone', 20).nullable()
    table.string('performance_type', 100).notNullable()
    table.text('description').nullable()
    table.string('social_media', 200).nullable()
    table.timestamp('signup_date').defaultTo(knex.fn.now())
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    
    // Foreign key constraint
    table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE')
    
    // Indexes
    table.index(['event_id'])
    table.index(['email'])
    table.index(['signup_date'])
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('performer_signups')
}
