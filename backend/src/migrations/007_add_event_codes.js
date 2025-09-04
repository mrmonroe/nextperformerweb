exports.up = function(knex) {
  return knex.schema.alterTable('events', function(table) {
    table.string('event_code', 6).nullable()
    table.text('qr_code_data').nullable()
    table.timestamp('code_generated_at').nullable()
  }).then(() => {
    // Generate event codes for existing events
    return knex('events').whereNull('event_code').then(events => {
      const updates = events.map(event => {
        const eventCode = Math.floor(100000 + Math.random() * 900000).toString()
        return knex('events')
          .where('id', event.id)
          .update({
            event_code: eventCode,
            code_generated_at: new Date()
          })
      })
      return Promise.all(updates)
    })
  }).then(() => {
    // Now make event_code not nullable and unique
    return knex.schema.alterTable('events', function(table) {
      table.string('event_code', 6).notNullable().alter()
      table.unique('event_code')
    })
  })
}

exports.down = function(knex) {
  return knex.schema.alterTable('events', function(table) {
    table.dropColumn('event_code')
    table.dropColumn('qr_code_data')
    table.dropColumn('code_generated_at')
  })
}
