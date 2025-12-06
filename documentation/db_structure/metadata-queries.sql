-- Tables
SELECT
 TABLE_SCHEMA,
 TABLE_NAME,
 COLUMN_NAME,
 DATA_TYPE,
 IS_NULLABLE,
 CHARACTER_MAXIMUM_LENGTH
FROM
 INFORMATION_SCHEMA.COLUMNS
 where TABLE_SCHEMA not in  ('sys')
 and TABLE_NAME not in ('accountTypes')
ORDER BY
 TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION;


-- Relationships

SELECT
  fk.name AS ForeignKeyName,
  s1.name AS ParentSchema,
  tp.name AS ParentTable,
  cp.name AS ParentColumn,
  s2.name AS ReferencedSchema,
  tr.name AS ReferencedTable,
  cr.name AS ReferencedColumn
FROM
  sys.foreign_keys fk
INNER JOIN
  sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN
  sys.tables tp ON fkc.parent_object_id = tp.object_id
INNER JOIN
  sys.schemas s1 ON tp.schema_id = s1.schema_id
INNER JOIN
  sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
INNER JOIN
  sys.tables tr ON fkc.referenced_object_id = tr.object_id
INNER JOIN
  sys.schemas s2 ON tr.schema_id = s2.schema_id
INNER JOIN
  sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
ORDER BY
  s1.name, tp.name, fk.name;



-- Lookup tables content

SELECT * from lkp_apartmentStatus
SELECT * from lkp_investmentType
SELECT * from lkp_personalTransTypes
SELECT * from lkp_stakeholderTypes
SELECT * from lkp_qualityLevel
SELECT * from accounts

