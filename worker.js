// Trigger Cloudflare deploy
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGIN || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const allowOrigin = allowed.includes('*')
    ? '*'
    : (
        allowed.includes(origin)
          ? origin
          : (allowed[0] || origin || '*')
      );

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Sync-Token',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(request, env),
      'Cache-Control': 'no-store'
    },
  });
}

function authorized(request, env) {
  const expected = env.SYNC_TOKEN || '';
  const actual = request.headers.get('X-Sync-Token') || '';

  return expected.length >= 8 && actual === expected;
}

async function readJson(request) {
  const text = await request.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

async function getKey(env, key) {
  return await env.DB
    .prepare(
      'SELECT value, updated_at FROM app_data WHERE key = ?'
    )
    .bind(key)
    .first();
}

async function putKey(env, key, value) {
  const now = new Date().toISOString();

  await env.DB
    .prepare(`
      INSERT INTO app_data (
        key,
        value,
        updated_at
      )
      VALUES (?, ?, ?)

      ON CONFLICT(key)
      DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `)
    .bind(
      key,
      JSON.stringify(value),
      now
    )
    .run();

  return now;
}

export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(
        null,
        {
          status: 204,
          headers: corsHeaders(request, env)
        }
      );
    }

    const url = new URL(request.url);

    const path =
      url.pathname.replace(/\/+$/, '') || '/';


    // =========================
    // HEALTH CHECK
    // =========================

    if (
      path === '/api/health' &&
      request.method === 'GET'
    ) {
      try {

        await env.DB
          .prepare('SELECT 1 AS ok')
          .first();

        return json(
          request,
          env,
          {
            ok: true,
            database: true,
            time: new Date().toISOString()
          }
        );

      } catch (error) {

        return json(
          request,
          env,
          {
            ok: false,
            error: error.message
          },
          500
        );
      }
    }


    // =========================
    // CHECK SYNC TOKEN
    // =========================

    if (!authorized(request, env)) {
      return json(
        request,
        env,
        {
          ok: false,
          error: 'unauthorized'
        },
        401
      );
    }


    try {

      // =========================
      // CONFIG
      // =========================

      if (path === '/api/config') {

        // GET CONFIG
        if (request.method === 'GET') {

          const row = await getKey(
            env,
            'config'
          );

          return json(
            request,
            env,
            {
              ok: true,
              found: !!row,
              data: row
                ? JSON.parse(row.value)
                : null,
              updatedAt:
                row?.updated_at || null
            }
          );
        }


        // SAVE CONFIG
        if (request.method === 'PUT') {

          const body =
            await readJson(request);

          if (
            body === undefined ||
            body === null ||
            typeof body !== 'object'
          ) {
            return json(
              request,
              env,
              {
                ok: false,
                error: 'invalid_json'
              },
              400
            );
          }

          const updatedAt =
            await putKey(
              env,
              'config',
              body
            );

          return json(
            request,
            env,
            {
              ok: true,
              updatedAt
            }
          );
        }
      }


      // =========================
      // MONTH DATA
      // =========================

      const monthMatch =
        path.match(
          /^\/api\/month\/(\d{4}-\d{2})$/
        );

      if (monthMatch) {

        const monthKey =
          monthMatch[1];

        const dbKey =
          `month:${monthKey}`;


        // GET MONTH
        if (request.method === 'GET') {

          const row =
            await getKey(
              env,
              dbKey
            );

          return json(
            request,
            env,
            {
              ok: true,
              found: !!row,
              data: row
                ? JSON.parse(row.value)
                : null,
              updatedAt:
                row?.updated_at || null
            }
          );
        }


        // SAVE MONTH
        if (request.method === 'PUT') {

          const body =
            await readJson(request);

          if (
            body === undefined ||
            body === null ||
            typeof body !== 'object'
          ) {
            return json(
              request,
              env,
              {
                ok: false,
                error: 'invalid_json'
              },
              400
            );
          }

          const updatedAt =
            await putKey(
              env,
              dbKey,
              body
            );

          return json(
            request,
            env,
            {
              ok: true,
              updatedAt
            }
          );
        }


        // DELETE MONTH
        if (
          request.method === 'DELETE'
        ) {

          await env.DB
            .prepare(
              'DELETE FROM app_data WHERE key = ?'
            )
            .bind(dbKey)
            .run();

          return json(
            request,
            env,
            {
              ok: true
            }
          );
        }
      }


      // =========================
      // LIST MONTHS
      // =========================

      if (
        path === '/api/months' &&
        request.method === 'GET'
      ) {

        const result =
          await env.DB
            .prepare(`
              SELECT
                key,
                updated_at
              FROM app_data
              WHERE key LIKE 'month:%'
              ORDER BY key DESC
            `)
            .all();

        return json(
          request,
          env,
          {
            ok: true,

            months:
              (result.results || [])
                .map(r => ({
                  key:
                    String(r.key)
                      .replace(
                        /^month:/,
                        ''
                      ),

                  updatedAt:
                    r.updated_at
                }))
          }
        );
      }


      // =========================
      // NOT FOUND
      // =========================

      return json(
        request,
        env,
        {
          ok: false,
          error: 'not_found'
        },
        404
      );


    } catch (error) {

      return json(
        request,
        env,
        {
          ok: false,
          error:
            error.message ||
            String(error)
        },
        500
      );
    }
  },
};
