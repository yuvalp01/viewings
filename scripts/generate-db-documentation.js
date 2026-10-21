#!/usr/bin/env node

/**
 * Database Schema Documentation Generator
 * 
 * This script connects to SQL Server, extracts the complete database schema structure,
 * and generates comprehensive markdown documentation.
 * 
 * Usage: node scripts/generate-db-documentation.js
 */

import mssql from 'mssql';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

/**
 * Get database configuration
 */
function getDatabaseConfig() {
  const config = {
    server: process.env.SQL_SERVER || '',
    database: process.env.SQL_DATABASE || '',
    user: process.env.SQL_USER || '',
    password: process.env.SQL_PASSWORD || '',
    // Increase default timeouts to support full-schema scans
    requestTimeout: 5 * 60 * 1000, // 5 minutes per request
    connectionTimeout: 30 * 1000, // 30 seconds to establish connection
    options: {
      encrypt: true,
      trustServerCertificate: process.env.NODE_ENV !== 'production'
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  if (!config.server || !config.database || !config.user || !config.password) {
    throw new Error('Missing required database environment variables: SQL_SERVER, SQL_DATABASE, SQL_USER, SQL_PASSWORD');
  }

  return config;
}

/**
 * Connect to SQL Server
 */
async function connectToDatabase() {
  const config = getDatabaseConfig();
  console.log('Connecting to SQL Server...');
  console.log(`Server: ${config.server}`);
  console.log(`Database: ${config.database}`);
  
  const pool = await mssql.connect(config);
  console.log('✅ Connected successfully\n');
  return pool;
}

/**
 * Get all user tables (exclude system tables)
 */
async function getTables(pool) {
  const result = await pool.request().query(`
    SELECT 
      TABLE_SCHEMA,
      TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME NOT LIKE 'sys%'
      AND TABLE_NAME NOT LIKE 'MS%'
    ORDER BY TABLE_NAME
  `);
  return result.recordset;
}

/**
 * Get columns for a specific table
 */
async function getColumns(pool, schemaName, tableName) {
  const result = await pool.request()
    .input('schemaName', mssql.NVarChar, schemaName)
    .input('tableName', mssql.NVarChar, tableName)
    .query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @schemaName
        AND TABLE_NAME = @tableName
      ORDER BY ORDINAL_POSITION
    `);
  return result.recordset;
}

/**
 * Get identity columns (auto-increment)
 */
async function getIdentityColumns(pool, schemaName, tableName) {
  const result = await pool.request()
    .input('schemaName', mssql.NVarChar, schemaName)
    .input('tableName', mssql.NVarChar, tableName)
    .query(`
      SELECT 
        COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @schemaName
        AND TABLE_NAME = @tableName
        AND COLUMNPROPERTY(OBJECT_ID(TABLE_SCHEMA + '.' + TABLE_NAME), COLUMN_NAME, 'IsIdentity') = 1
    `);
  return result.recordset.map(r => r.COLUMN_NAME);
}

/**
 * Get primary keys for a table
 */
async function getPrimaryKeys(pool, schemaName, tableName) {
  const result = await pool.request()
    .input('schemaName', mssql.NVarChar, schemaName)
    .input('tableName', mssql.NVarChar, tableName)
    .query(`
      SELECT 
        kcu.COLUMN_NAME,
        kcu.ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
        AND tc.TABLE_NAME = kcu.TABLE_NAME
      WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        AND tc.TABLE_SCHEMA = @schemaName
        AND tc.TABLE_NAME = @tableName
      ORDER BY kcu.ORDINAL_POSITION
    `);
  return result.recordset.map(r => r.COLUMN_NAME);
}

/**
 * Get foreign keys for a table
 */
async function getForeignKeys(pool, schemaName, tableName) {
  const result = await pool.request()
    .input('schemaName', mssql.NVarChar, schemaName)
    .input('tableName', mssql.NVarChar, tableName)
    .query(`
      SELECT 
        fk.CONSTRAINT_NAME,
        fk.COLUMN_NAME,
        pk.TABLE_SCHEMA AS REFERENCED_SCHEMA,
        pk.TABLE_NAME AS REFERENCED_TABLE,
        pk.COLUMN_NAME AS REFERENCED_COLUMN,
        rc.UPDATE_RULE,
        rc.DELETE_RULE
      FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
      INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk
        ON rc.CONSTRAINT_NAME = fk.CONSTRAINT_NAME
        AND rc.CONSTRAINT_SCHEMA = fk.CONSTRAINT_SCHEMA
      INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE pk
        ON rc.UNIQUE_CONSTRAINT_NAME = pk.CONSTRAINT_NAME
        AND rc.UNIQUE_CONSTRAINT_SCHEMA = pk.CONSTRAINT_SCHEMA
        AND fk.ORDINAL_POSITION = pk.ORDINAL_POSITION
      WHERE fk.TABLE_SCHEMA = @schemaName
        AND fk.TABLE_NAME = @tableName
      ORDER BY fk.CONSTRAINT_NAME, fk.ORDINAL_POSITION
    `);
  return result.recordset;
}

/**
 * Get indexes for a table
 */
async function getIndexes(pool, schemaName, tableName) {
  const result = await pool.request()
    .input('schemaName', mssql.NVarChar, schemaName)
    .input('tableName', mssql.NVarChar, tableName)
    .query(`
      SELECT 
        i.name AS INDEX_NAME,
        i.is_unique AS IS_UNIQUE,
        i.is_primary_key AS IS_PRIMARY_KEY,
        i.type_desc AS INDEX_TYPE,
        STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS COLUMNS
      FROM sys.indexes i
      INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
      INNER JOIN sys.tables t ON i.object_id = t.object_id
      INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
      WHERE s.name = @schemaName
        AND t.name = @tableName
        AND i.name IS NOT NULL
      GROUP BY i.name, i.is_unique, i.is_primary_key, i.type_desc
      ORDER BY i.is_primary_key DESC, i.is_unique DESC, i.name
    `);
  return result.recordset;
}

/**
 * Get check constraints for a table
 */
async function getCheckConstraints(pool, schemaName, tableName) {
  const result = await pool.request()
    .input('schemaName', mssql.NVarChar, schemaName)
    .input('tableName', mssql.NVarChar, tableName)
    .query(`
      SELECT DISTINCT
        cc.CONSTRAINT_NAME,
        cc.CHECK_CLAUSE
      FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
      INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        ON cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
        AND cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
      WHERE tc.TABLE_SCHEMA = @schemaName
        AND tc.TABLE_NAME = @tableName
        AND tc.CONSTRAINT_TYPE = 'CHECK'
    `);
  return result.recordset;
}

/**
 * Get unique constraints (excluding primary keys)
 */
async function getUniqueConstraints(pool, schemaName, tableName) {
  const result = await pool.request()
    .input('schemaName', mssql.NVarChar, schemaName)
    .input('tableName', mssql.NVarChar, tableName)
    .query(`
      SELECT 
        tc.CONSTRAINT_NAME,
        STRING_AGG(kcu.COLUMN_NAME, ', ') WITHIN GROUP (ORDER BY kcu.ORDINAL_POSITION) AS COLUMNS
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
        AND tc.TABLE_NAME = kcu.TABLE_NAME
      WHERE tc.CONSTRAINT_TYPE = 'UNIQUE'
        AND tc.TABLE_SCHEMA = @schemaName
        AND tc.TABLE_NAME = @tableName
      GROUP BY tc.CONSTRAINT_NAME
    `);
  return result.recordset;
}

/**
 * Format data type with precision/scale
 */
function formatDataType(column) {
  let type = column.DATA_TYPE.toUpperCase();
  
  if (column.CHARACTER_MAXIMUM_LENGTH !== null) {
    if (column.CHARACTER_MAXIMUM_LENGTH === -1) {
      type += '(MAX)';
    } else {
      type += `(${column.CHARACTER_MAXIMUM_LENGTH})`;
    }
  } else if (column.NUMERIC_PRECISION !== null) {
    if (column.NUMERIC_SCALE !== null && column.NUMERIC_SCALE !== 0) {
      type += `(${column.NUMERIC_PRECISION},${column.NUMERIC_SCALE})`;
    } else {
      type += `(${column.NUMERIC_PRECISION})`;
    }
  }
  
  return type;
}

/**
 * Format default value
 */
function formatDefault(defaultValue, isIdentity) {
  if (isIdentity) {
    return 'IDENTITY';
  }
  if (defaultValue === null || defaultValue === undefined) {
    return '';
  }
  // Remove parentheses and clean up default value
  return defaultValue.toString().replace(/^\(+|\)+$/g, '').trim();
}

/**
 * Generate markdown documentation
 */
function generateMarkdown(schemaData, databaseName) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  let markdown = `# Database Schema Documentation\n\n`;
  markdown += `**Generated:** ${timestamp}\n`;
  markdown += `**Database:** ${databaseName}\n\n`;
  
  // Table of Contents
  markdown += `## Table of Contents\n\n`;
  schemaData.tables.forEach(table => {
    const anchor = table.TABLE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    markdown += `- [${table.TABLE_NAME}](#${anchor})\n`;
  });
  markdown += `\n---\n\n`;
  
  // Table details
  schemaData.tables.forEach(table => {
    const tableInfo = schemaData.tableDetails[table.TABLE_NAME];
    const anchor = table.TABLE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    markdown += `## ${table.TABLE_NAME}\n\n`;
    
    // Columns table
    markdown += `### Columns\n\n`;
    markdown += `| Column | Type | Nullable | Default | Primary Key | Foreign Key |\n`;
    markdown += `|--------|------|----------|---------|------------|-------------|\n`;
    
    tableInfo.columns.forEach(col => {
      const isPrimaryKey = tableInfo.primaryKeys.includes(col.COLUMN_NAME);
      const isIdentity = tableInfo.identityColumns.includes(col.COLUMN_NAME);
      const foreignKey = tableInfo.foreignKeys.find(fk => fk.COLUMN_NAME === col.COLUMN_NAME);
      
      const nullable = col.IS_NULLABLE === 'YES' ? 'YES' : 'NO';
      const defaultVal = formatDefault(col.COLUMN_DEFAULT, isIdentity);
      const pkMark = isPrimaryKey ? '✓' : '';
      const fkMark = foreignKey 
        ? `→ ${foreignKey.REFERENCED_TABLE}.${foreignKey.REFERENCED_COLUMN}` 
        : '';
      
      markdown += `| ${col.COLUMN_NAME} | ${formatDataType(col)} | ${nullable} | ${defaultVal} | ${pkMark} | ${fkMark} |\n`;
    });
    
    markdown += `\n`;
    
    // Primary Keys
    if (tableInfo.primaryKeys.length > 0) {
      markdown += `### Primary Keys\n\n`;
      tableInfo.primaryKeys.forEach(pk => {
        markdown += `- **${pk}**\n`;
      });
      markdown += `\n`;
    }
    
    // Foreign Keys
    if (tableInfo.foreignKeys.length > 0) {
      markdown += `### Foreign Keys\n\n`;
      const fkGroups = {};
      tableInfo.foreignKeys.forEach(fk => {
        if (!fkGroups[fk.CONSTRAINT_NAME]) {
          fkGroups[fk.CONSTRAINT_NAME] = [];
        }
        fkGroups[fk.CONSTRAINT_NAME].push(fk);
      });
      
      Object.entries(fkGroups).forEach(([constraintName, fks]) => {
        const fk = fks[0];
        const columns = fks.map(f => f.COLUMN_NAME).join(', ');
        const refColumns = fks.map(f => f.REFERENCED_COLUMN).join(', ');
        markdown += `- **${constraintName}**\n`;
        markdown += `  - Columns: ${columns}\n`;
        markdown += `  - References: ${fk.REFERENCED_TABLE}(${refColumns})\n`;
        markdown += `  - Update Rule: ${fk.UPDATE_RULE}\n`;
        markdown += `  - Delete Rule: ${fk.DELETE_RULE}\n`;
      });
      markdown += `\n`;
    }
    
    // Indexes
    if (tableInfo.indexes.length > 0) {
      markdown += `### Indexes\n\n`;
      markdown += `| Index Name | Type | Unique | Columns |\n`;
      markdown += `|------------|------|--------|----------|\n`;
      tableInfo.indexes.forEach(idx => {
        const type = idx.IS_PRIMARY_KEY ? 'PRIMARY KEY' : idx.INDEX_TYPE;
        const unique = idx.IS_UNIQUE ? '✓' : '';
        markdown += `| ${idx.INDEX_NAME} | ${type} | ${unique} | ${idx.COLUMNS} |\n`;
      });
      markdown += `\n`;
    }
    
    // Unique Constraints
    if (tableInfo.uniqueConstraints.length > 0) {
      markdown += `### Unique Constraints\n\n`;
      tableInfo.uniqueConstraints.forEach(uc => {
        markdown += `- **${uc.CONSTRAINT_NAME}**: ${uc.COLUMNS}\n`;
      });
      markdown += `\n`;
    }
    
    // Check Constraints
    if (tableInfo.checkConstraints.length > 0) {
      markdown += `### Check Constraints\n\n`;
      tableInfo.checkConstraints.forEach(cc => {
        markdown += `- **${cc.CONSTRAINT_NAME}**: \`${cc.CHECK_CLAUSE}\`\n`;
      });
      markdown += `\n`;
    }
    
    markdown += `---\n\n`;
  });
  
  // Relationships Diagram
  markdown += `## Relationships Diagram\n\n`;
  markdown += `\`\`\`mermaid\n`;
  markdown += `erDiagram\n`;
  
  // Add all tables
  schemaData.tables.forEach(table => {
    const tableName = table.TABLE_NAME;
    markdown += `    ${tableName} {\n`;
    const tableInfo = schemaData.tableDetails[tableName];
    tableInfo.columns.slice(0, 5).forEach(col => { // Show first 5 columns
      const type = formatDataType(col).replace(/\([^)]*\)/g, '');
      markdown += `        ${type} ${col.COLUMN_NAME}\n`;
    });
    if (tableInfo.columns.length > 5) {
      markdown += `        ... ${tableInfo.columns.length - 5} more columns\n`;
    }
    markdown += `    }\n`;
  });
  
  // Add relationships
  schemaData.tables.forEach(table => {
    const tableInfo = schemaData.tableDetails[table.TABLE_NAME];
    tableInfo.foreignKeys.forEach(fk => {
      markdown += `    ${table.TABLE_NAME} }o--o| ${fk.REFERENCED_TABLE} : "${fk.COLUMN_NAME} -> ${fk.REFERENCED_COLUMN}"\n`;
    });
  });
  
  markdown += `\`\`\`\n\n`;
  
  // Summary Statistics
  markdown += `## Summary Statistics\n\n`;
  markdown += `- **Total Tables:** ${schemaData.tables.length}\n`;
  let totalColumns = 0;
  let totalForeignKeys = 0;
  let totalIndexes = 0;
  
  schemaData.tables.forEach(table => {
    const tableInfo = schemaData.tableDetails[table.TABLE_NAME];
    totalColumns += tableInfo.columns.length;
    totalForeignKeys += tableInfo.foreignKeys.length;
    totalIndexes += tableInfo.indexes.length;
  });
  
  markdown += `- **Total Columns:** ${totalColumns}\n`;
  markdown += `- **Total Foreign Keys:** ${totalForeignKeys}\n`;
  markdown += `- **Total Indexes:** ${totalIndexes}\n`;
  
  return markdown;
}

/**
 * Main function
 */
async function main() {
  let pool = null;
  
  try {
    // Connect to database
    pool = await connectToDatabase();
    
    // Get database name
    const dbResult = await pool.request().query('SELECT DB_NAME() AS DatabaseName');
    const databaseName = dbResult.recordset[0].DatabaseName;
    
    // Get all tables
    console.log('Fetching tables...');
    const tables = await getTables(pool);
    console.log(`Found ${tables.length} tables\n`);
    
    // Get details for each table
    const schemaData = {
      tables: tables,
      tableDetails: {}
    };
    
    for (const table of tables) {
      console.log(`Processing table: ${table.TABLE_NAME}...`);
      const schemaName = table.TABLE_SCHEMA || 'dbo';
      
      const [
        columns,
        identityColumns,
        primaryKeys,
        foreignKeys,
        indexes,
        checkConstraints,
        uniqueConstraints
      ] = await Promise.all([
        getColumns(pool, schemaName, table.TABLE_NAME),
        getIdentityColumns(pool, schemaName, table.TABLE_NAME),
        getPrimaryKeys(pool, schemaName, table.TABLE_NAME),
        getForeignKeys(pool, schemaName, table.TABLE_NAME),
        getIndexes(pool, schemaName, table.TABLE_NAME),
        getCheckConstraints(pool, schemaName, table.TABLE_NAME),
        getUniqueConstraints(pool, schemaName, table.TABLE_NAME)
      ]);
      
      schemaData.tableDetails[table.TABLE_NAME] = {
        columns,
        identityColumns,
        primaryKeys,
        foreignKeys,
        indexes,
        checkConstraints,
        uniqueConstraints
      };
    }
    
    console.log('\nGenerating markdown documentation...');
    const markdown = generateMarkdown(schemaData, databaseName);
    
    // Ensure documentation directory exists
    const docsDir = join(__dirname, '..', 'documentation');
    mkdirSync(docsDir, { recursive: true });
    
    // Write to file
    const outputPath = join(docsDir, 'database-schema.md');
    writeFileSync(outputPath, markdown, 'utf8');
    
    console.log(`✅ Documentation generated successfully!`);
    console.log(`📄 Output file: ${outputPath}`);
    console.log(`\nSummary:`);
    console.log(`  - Tables: ${tables.length}`);
    let totalColumns = 0;
    schemaData.tables.forEach(table => {
      totalColumns += schemaData.tableDetails[table.TABLE_NAME].columns.length;
    });
    console.log(`  - Columns: ${totalColumns}`);
    
  } catch (error) {
    console.error('❌ Error generating documentation:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

