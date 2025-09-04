exports.up = function(knex) {
  return knex.schema.createTable('venues', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('name').notNullable()
    table.text('description')
    table.string('address').notNullable()
    table.string('city').notNullable()
    table.string('state').notNullable()
    table.string('zip_code').notNullable()
    table.string('phone')
    table.string('website')
    table.string('image_url')
    table.decimal('latitude', 10, 8)
    table.decimal('longitude', 11, 8)
    table.boolean('is_active').defaultTo(true)
    table.timestamps(true, true)
    
    table.index('name')
    table.index('city')
    table.index('state')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('venues')
}
