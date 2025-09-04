exports.up = function(knex) {
  return knex.schema.createTable('events', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('title').notNullable()
    table.text('description').notNullable()
    table.uuid('venue_id').references('id').inTable('venues').onDelete('CASCADE')
    table.uuid('created_by').references('id').inTable('users').onDelete('CASCADE')
    table.date('event_date').notNullable()
    table.time('start_time').notNullable()
    table.time('end_time').notNullable()
    table.boolean('is_spotlight').defaultTo(false)
    table.boolean('is_active').defaultTo(true)
    table.integer('max_attendees')
    table.string('image_url')
    table.timestamps(true, true)
    
    table.index('event_date')
    table.index('venue_id')
    table.index('created_by')
    table.index('is_spotlight')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('events')
}
