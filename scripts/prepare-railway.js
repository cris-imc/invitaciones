const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Reemplazar SQLite por PostgreSQL para Railway
schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');

fs.writeFileSync(schemaPath, schema);
console.log('✅ schema.prisma configurado para PostgreSQL exitosamente (Railway)');
