exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('email').unique().notNullable()
    table.string('password_hash').notNullable()
    table.string('first_name').notNullable()
    table.string('last_name').notNullable()
    table.string('display_name').notNullable()
    table.text('bio')
    table.string('avatar_url')
    table.boolean('is_verified').defaultTo(false)
    table.timestamp('email_verified_at')
    table.timestamp('last_login_at')
    table.timestamps(true, true)
    
    table.index('email')
    table.index('display_name')
  })
}

exports.down = function(knex) {
  return knex.schema.dropTable('users')
}
