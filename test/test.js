require("dotenv").config();
const t = require("tap");
const pg = require("pg");
const truncate = require("../");

const pool = pg.Pool();

// create a table and populate it with data we can use for testing purposes.
// this is paramaterized so we can setup multiple tables.
const populate = async name => {
  const text = `CREATE TABLE IF NOT EXISTS ${name} (
    id INT GENERATED ALWAYS AS IDENTITY,
    test VARCHAR NOT NULL
  )`;
  await pool.query(text);
  const values = ["foo", "bar", "baz"];
  const params = values.map((e, i) => `($${i + 1})`).join(",");
  await pool.query(`INSERT INTO ${name} (test) VALUES ${params}`, values);
  return;
};

t.test("beforeEach", async t => {
  await populate("foo");
  await populate("bar");
  t.end();
});

t.test("truncate", async t => {
  t.tearDown(() => {
    pool.end();
  });

  t.test("truncates the schema with default options", async t => {
    await truncate(pool);
    const text = `SELECT COUNT(*) FROM foo; SELECT COUNT(*) FROM bar`;
    const [foo, bar] = await pool.query(text);
    t.equal(foo.rows[0].count, "0");
    t.equal(bar.rows[0].count, "0");
    t.end();
  });

  t.test("bails out with a guard method", async t => {
    t.rejects(async () => {
      await truncate(pool, {
        guard: true,
        guardMethod: name => /.*_make_my_funk_the_p_funk/.test(name)
      });
    });
    t.end();
  });

  t.test("continues with a valid guard", async t => {
    await truncate(pool, {
      guard: true,
      guardMethod: () => true
    });
    t.end();
  });

  t.test("continues with a default guard", async t => {
    await truncate(pool, {
      guard: true
    });
    t.end();
  });

  t.test("bails early on invalid database argument", async t => {
    t.rejects(async () => {
      await truncate();
    });
    t.end();
  });

  t.end();
});
