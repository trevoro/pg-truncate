const defaultOptions = {
  guard: false,
  schema: "public",
  guardMethod: name => /.*_test$/.test(name)
};

async function guard(db, method) {
  const text = `SELECT current_database() as name;`;
  const { rows } = await db.query(text);
  const name = rows[0].name;
  const proceed = method(name);
  if (proceed === false) {
    throw new Error(`refusing to continue; '${name}' does not match pattern`);
  }
}

async function tableNames(db, schema) {
  const text = `SELECT table_name as name
  FROM information_schema.tables 
  WHERE table_schema = $1
  AND table_type = 'BASE TABLE'`;

  const { rows } = await db.query(text, [schema]);
  const tables = rows.map(r => `${schema}.${r.name}`);
  return tables;
}

async function truncate(db, args = {}) {
  if (!db || !db.query) {
    throw new Error("must provide db");
  }

  const options = { ...defaultOptions, ...args };
  if (options.guard) {
    await guard(db, options.guardMethod);
  }

  const names = await tableNames(db, options.schema);
  const text = `TRUNCATE TABLE ${names.join(", ")} RESTART IDENTITY CASCADE`;
  await db.query(text);
  return;
}

module.exports = truncate;
