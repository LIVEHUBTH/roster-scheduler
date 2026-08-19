const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

const AUTH = {
  SESSION_HOURS: 12,
  PBKDF2_ITERATIONS: 120000,
  PASSWORD_MIN: 8,
  ROLES: ['admin', 'scheduler', 'approver', 'viewer'],
};

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGIN || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const allowOrigin = allowed.includes('*')
    ? '*'
    : (allowed.includes(origin) ? origin : (allowed[0] || origin || '*'));

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Sync-Token,Authorization',
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
      'Cache-Control': 'no-store',
    },
  });
}

function legacyAuthorized(request, env) {
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

function cleanUsername(value) {
  return String(value || '').trim().toLowerCase();
}

function validUsername(username) {
  return /^[a-z0-9._-]{3,50}$/.test(username);
}

function validRole(role) {
  return AUTH.ROLES.includes(role);
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || null,
  };
}

function bytesToBase64(bytes) {
  let binary = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return bytesToBase64(arr)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function sha256Base64(text) {
  const input = new TextEncoder().encode(String(text));
  const digest = await crypto.subtle.digest('SHA-256', input);
  return bytesToBase64(new Uint8Array(digest));
}

async function passwordHash(password, saltBase64, iterations = AUTH.PBKDF2_ITERATIONS) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: base64ToBytes(saltBase64),
      iterations,
    },
    material,
    256
  );

  return bytesToBase64(new Uint8Array(bits));
}

async function makePasswordRecord(password) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltBase64 = bytesToBase64(salt);
  const hash = await passwordHash(password, saltBase64);
  return { salt: saltBase64, hash };
}

function safeEqualString(a, b) {
  const aa = String(a || '');
  const bb = String(b || '');
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  return diff === 0;
}

async function audit(env, user, action, detail = null) {
  try {
    await env.DB.prepare(`
      INSERT INTO auth_audit_log (user_id, username, action, detail, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user?.id ?? null,
      user?.username ?? null,
      action,
      detail ? JSON.stringify(detail) : null,
      new Date().toISOString()
    ).run();
  } catch (_) {
    // Audit must never break the main request.
  }
}

function bearerToken(request) {
  const value = request.headers.get('Authorization') || '';
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

async function getSessionUser(request, env) {
  const token = bearerToken(request);
  if (!token) return null;

  const tokenHash = await sha256Base64(token);
  const row = await env.DB.prepare(`
    SELECT
      u.id, u.username, u.display_name, u.role, u.is_active,
      u.created_at, u.updated_at, u.last_login_at,
      s.id AS session_id, s.expires_at, s.revoked_at
    FROM auth_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
    LIMIT 1
  `).bind(tokenHash).first();

  if (!row || !row.is_active || row.revoked_at) return null;

  const expires = Date.parse(row.expires_at);
  if (!Number.isFinite(expires) || expires <= Date.now()) return null;

  const now = new Date().toISOString();
  env.DB.prepare(
    'UPDATE auth_sessions SET last_seen_at = ? WHERE id = ?'
  ).bind(now, row.session_id).run().catch(() => {});

  return row;
}

async function requestIdentity(request, env) {
  if (legacyAuthorized(request, env)) {
    return {
      kind: 'legacy',
      user: {
        id: null,
        username: 'sync-token',
        display_name: 'Legacy Sync Token',
        role: 'admin',
        is_active: 1,
      },
    };
  }

  const user = await getSessionUser(request, env);
  if (!user) return null;
  return { kind: 'session', user };
}

function roleAllowed(identity, allowedRoles) {
  if (!identity) return false;
  if (identity.kind === 'legacy') return true;
  return allowedRoles.includes(identity.user.role);
}

async function requireIdentity(request, env, allowedRoles = AUTH.ROLES) {
  const identity = await requestIdentity(request, env);
  if (!identity) return { ok: false, status: 401, error: 'unauthorized' };
  if (!roleAllowed(identity, allowedRoles)) {
    return { ok: false, status: 403, error: 'forbidden' };
  }
  return { ok: true, identity };
}

async function getKey(env, key) {
  return await env.DB.prepare(
    'SELECT value, updated_at FROM app_data WHERE key = ?'
  ).bind(key).first();
}

async function putKey(env, key, value) {
  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO app_data (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key)
    DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).bind(key, JSON.stringify(value), now).run();
  return now;
}

async function countUsers(env) {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first();
  return Number(row?.n || 0);
}

async function createUser(env, { username, displayName, password, role }) {
  username = cleanUsername(username);
  displayName = String(displayName || '').trim();
  role = String(role || '').trim();

  if (!validUsername(username)) {
    throw Object.assign(new Error('invalid_username'), { status: 400 });
  }
  if (!displayName || displayName.length > 100) {
    throw Object.assign(new Error('invalid_display_name'), { status: 400 });
  }
  if (!validRole(role)) {
    throw Object.assign(new Error('invalid_role'), { status: 400 });
  }
  if (typeof password !== 'string' || password.length < AUTH.PASSWORD_MIN || password.length > 200) {
    throw Object.assign(new Error('password_too_short'), { status: 400 });
  }

  const existing = await env.DB.prepare(
    'SELECT id FROM users WHERE username = ? LIMIT 1'
  ).bind(username).first();

  if (existing) {
    throw Object.assign(new Error('username_exists'), { status: 409 });
  }

  const pw = await makePasswordRecord(password);
  const now = new Date().toISOString();

  const result = await env.DB.prepare(`
    INSERT INTO users (
      username, display_name, password_hash, password_salt,
      role, is_active, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `).bind(
    username,
    displayName,
    pw.hash,
    pw.salt,
    role,
    now,
    now
  ).run();

  return await env.DB.prepare(`
    SELECT id, username, display_name, role, is_active,
           created_at, updated_at, last_login_at
    FROM users
    WHERE id = ?
  `).bind(result.meta.last_row_id).first();
}

async function login(request, env) {
  const body = await readJson(request);
  if (!body || body === undefined) {
    return json(request, env, { ok: false, error: 'invalid_json' }, 400);
  }

  const username = cleanUsername(body.username);
  const password = String(body.password || '');

  if (!username || !password) {
    return json(request, env, { ok: false, error: 'username_and_password_required' }, 400);
  }

  const user = await env.DB.prepare(`
    SELECT id, username, display_name, password_hash, password_salt,
           role, is_active, created_at, updated_at, last_login_at
    FROM users
    WHERE username = ?
    LIMIT 1
  `).bind(username).first();

  if (!user || !user.is_active) {
    await audit(env, user || { username }, 'login_failed', { reason: 'invalid_credentials' });
    return json(request, env, { ok: false, error: 'invalid_credentials' }, 401);
  }

  const computed = await passwordHash(password, user.password_salt);
  if (!safeEqualString(computed, user.password_hash)) {
    await audit(env, user, 'login_failed', { reason: 'invalid_credentials' });
    return json(request, env, { ok: false, error: 'invalid_credentials' }, 401);
  }

  const token = randomToken(32);
  const tokenHash = await sha256Base64(token);
  const now = new Date();
  const expires = new Date(now.getTime() + AUTH.SESSION_HOURS * 60 * 60 * 1000);

  await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO auth_sessions (
        token_hash, user_id, created_at, expires_at, last_seen_at, revoked_at
      )
      VALUES (?, ?, ?, ?, ?, NULL)
    `).bind(
      tokenHash,
      user.id,
      now.toISOString(),
      expires.toISOString(),
      now.toISOString()
    ),
    env.DB.prepare(
      'UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?'
    ).bind(now.toISOString(), now.toISOString(), user.id),
  ]);

  await audit(env, user, 'login_success');

  return json(request, env, {
    ok: true,
    token,
    expiresAt: expires.toISOString(),
    user: publicUser({ ...user, last_login_at: now.toISOString() }),
  });
}

async function logout(request, env) {
  const token = bearerToken(request);
  if (!token) return json(request, env, { ok: true });

  const tokenHash = await sha256Base64(token);
  const user = await getSessionUser(request, env);
  const now = new Date().toISOString();

  await env.DB.prepare(`
    UPDATE auth_sessions
    SET revoked_at = ?
    WHERE token_hash = ? AND revoked_at IS NULL
  `).bind(now, tokenHash).run();

  if (user) await audit(env, user, 'logout');
  return json(request, env, { ok: true });
}

async function bootstrapAdmin(request, env) {
  if (!legacyAuthorized(request, env)) {
    return json(request, env, { ok: false, error: 'unauthorized' }, 401);
  }

  if (await countUsers(env) > 0) {
    return json(request, env, { ok: false, error: 'bootstrap_closed' }, 409);
  }

  const body = await readJson(request);
  if (!body || body === undefined) {
    return json(request, env, { ok: false, error: 'invalid_json' }, 400);
  }

  try {
    const user = await createUser(env, {
      username: body.username,
      displayName: body.displayName,
      password: body.password,
      role: 'admin',
    });
    await audit(env, user, 'bootstrap_admin_created');
    return json(request, env, { ok: true, user: publicUser(user) }, 201);
  } catch (error) {
    return json(request, env, { ok: false, error: error.message }, error.status || 500);
  }
}

async function adminCreateUser(request, env, identity) {
  const body = await readJson(request);
  if (!body || body === undefined) {
    return json(request, env, { ok: false, error: 'invalid_json' }, 400);
  }

  try {
    const user = await createUser(env, {
      username: body.username,
      displayName: body.displayName,
      password: body.password,
      role: body.role,
    });

    await audit(env, identity.user, 'user_created', {
      targetUserId: user.id,
      targetUsername: user.username,
      targetRole: user.role,
    });

    return json(request, env, { ok: true, user: publicUser(user) }, 201);
  } catch (error) {
    return json(request, env, { ok: false, error: error.message }, error.status || 500);
  }
}

async function adminUpdateUser(request, env, identity, userId) {
  const body = await readJson(request);
  if (!body || body === undefined) {
    return json(request, env, { ok: false, error: 'invalid_json' }, 400);
  }

  const target = await env.DB.prepare(`
    SELECT id, username, display_name, password_hash, password_salt,
           role, is_active, created_at, updated_at, last_login_at
    FROM users
    WHERE id = ?
  `).bind(userId).first();

  if (!target) {
    return json(request, env, { ok: false, error: 'user_not_found' }, 404);
  }

  let displayName = body.displayName === undefined
    ? target.display_name
    : String(body.displayName || '').trim();

  let role = body.role === undefined
    ? target.role
    : String(body.role || '').trim();

  let isActive = body.isActive === undefined
    ? !!target.is_active
    : !!body.isActive;

  if (!displayName || displayName.length > 100) {
    return json(request, env, { ok: false, error: 'invalid_display_name' }, 400);
  }
  if (!validRole(role)) {
    return json(request, env, { ok: false, error: 'invalid_role' }, 400);
  }

  if (
    Number(identity.user.id) === Number(userId) &&
    (!isActive || role !== 'admin')
  ) {
    return json(request, env, { ok: false, error: 'cannot_remove_own_admin_access' }, 400);
  }

  let passwordHashValue = target.password_hash;
  let passwordSaltValue = target.password_salt;

  if (body.password !== undefined && body.password !== '') {
    const password = String(body.password);
    if (password.length < AUTH.PASSWORD_MIN || password.length > 200) {
      return json(request, env, { ok: false, error: 'password_too_short' }, 400);
    }
    const pw = await makePasswordRecord(password);
    passwordHashValue = pw.hash;
    passwordSaltValue = pw.salt;
  }

  const now = new Date().toISOString();

  await env.DB.prepare(`
    UPDATE users
    SET display_name = ?,
        password_hash = ?,
        password_salt = ?,
        role = ?,
        is_active = ?,
        updated_at = ?
    WHERE id = ?
  `).bind(
    displayName,
    passwordHashValue,
    passwordSaltValue,
    role,
    isActive ? 1 : 0,
    now,
    userId
  ).run();

  if (!isActive || body.password !== undefined) {
    await env.DB.prepare(`
      UPDATE auth_sessions
      SET revoked_at = ?
      WHERE user_id = ? AND revoked_at IS NULL
    `).bind(now, userId).run();
  }

  const updated = await env.DB.prepare(`
    SELECT id, username, display_name, role, is_active,
           created_at, updated_at, last_login_at
    FROM users
    WHERE id = ?
  `).bind(userId).first();

  await audit(env, identity.user, 'user_updated', {
    targetUserId: userId,
    targetUsername: target.username,
    role: updated.role,
    isActive: !!updated.is_active,
    passwordChanged: body.password !== undefined && body.password !== '',
  });

  return json(request, env, { ok: true, user: publicUser(updated) });
}

async function cleanupExpiredSessions(env) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    'DELETE FROM auth_sessions WHERE expires_at <= ? OR revoked_at IS NOT NULL'
  ).bind(now).run();
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env),
      });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    // ---------------- Public health ----------------
    if (path === '/api/health' && request.method === 'GET') {
      try {
        await env.DB.prepare('SELECT 1 AS ok').first();
        return json(request, env, {
          ok: true,
          database: true,
          auth: true,
          version: '22.0-auth',
          time: new Date().toISOString(),
        });
      } catch (error) {
        return json(request, env, {
          ok: false,
          error: error.message || String(error),
        }, 500);
      }
    }

    // ---------------- Authentication ----------------
    if (path === '/api/auth/bootstrap-admin' && request.method === 'POST') {
      return bootstrapAdmin(request, env);
    }

    if (path === '/api/auth/login' && request.method === 'POST') {
      return login(request, env);
    }

    if (path === '/api/auth/logout' && request.method === 'POST') {
      return logout(request, env);
    }

    if (path === '/api/auth/me' && request.method === 'GET') {
      const auth = await requireIdentity(request, env);
      if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

      return json(request, env, {
        ok: true,
        user: publicUser(auth.identity.user),
        legacy: auth.identity.kind === 'legacy',
      });
    }

    try {
      // ---------------- User management (admin) ----------------
      if (path === '/api/admin/users') {
        const auth = await requireIdentity(request, env, ['admin']);
        if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

        if (request.method === 'GET') {
          const result = await env.DB.prepare(`
            SELECT id, username, display_name, role, is_active,
                   created_at, updated_at, last_login_at
            FROM users
            ORDER BY display_name COLLATE NOCASE, username COLLATE NOCASE
          `).all();

          return json(request, env, {
            ok: true,
            users: (result.results || []).map(publicUser),
          });
        }

        if (request.method === 'POST') {
          return adminCreateUser(request, env, auth.identity);
        }
      }

      const userMatch = path.match(/^\/api\/admin\/users\/(\d+)$/);
      if (userMatch && (request.method === 'PUT' || request.method === 'PATCH')) {
        const auth = await requireIdentity(request, env, ['admin']);
        if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

        return adminUpdateUser(
          request,
          env,
          auth.identity,
          Number(userMatch[1])
        );
      }

      if (path === '/api/admin/auth-audit' && request.method === 'GET') {
        const auth = await requireIdentity(request, env, ['admin']);
        if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

        const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 100), 1), 500);
        const result = await env.DB.prepare(`
          SELECT id, user_id, username, action, detail, created_at
          FROM auth_audit_log
          ORDER BY id DESC
          LIMIT ?
        `).bind(limit).all();

        return json(request, env, {
          ok: true,
          entries: result.results || [],
        });
      }

      if (path === '/api/admin/cleanup-sessions' && request.method === 'POST') {
        const auth = await requireIdentity(request, env, ['admin']);
        if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

        await cleanupExpiredSessions(env);
        await audit(env, auth.identity.user, 'expired_sessions_cleaned');
        return json(request, env, { ok: true });
      }

      // ---------------- Existing Cloud Sync + role-aware access ----------------
      if (path === '/api/config') {
        if (request.method === 'GET') {
          const auth = await requireIdentity(request, env, AUTH.ROLES);
          if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

          const row = await getKey(env, 'config');
          return json(request, env, {
            ok: true,
            found: !!row,
            data: row ? JSON.parse(row.value) : null,
            updatedAt: row?.updated_at || null,
          });
        }

        if (request.method === 'PUT') {
          const auth = await requireIdentity(request, env, ['admin', 'scheduler']);
          if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

          const body = await readJson(request);
          if (body === undefined || body === null || typeof body !== 'object') {
            return json(request, env, { ok: false, error: 'invalid_json' }, 400);
          }

          const updatedAt = await putKey(env, 'config', body);
          return json(request, env, { ok: true, updatedAt });
        }
      }

      const monthMatch = path.match(/^\/api\/month\/(\d{4}-\d{2})$/);
      if (monthMatch) {
        const monthKey = monthMatch[1];
        const dbKey = `month:${monthKey}`;

        if (request.method === 'GET') {
          const auth = await requireIdentity(request, env, AUTH.ROLES);
          if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

          const row = await getKey(env, dbKey);
          return json(request, env, {
            ok: true,
            found: !!row,
            data: row ? JSON.parse(row.value) : null,
            updatedAt: row?.updated_at || null,
          });
        }

        if (request.method === 'PUT') {
          // Approver must be able to persist approval/lock workflow state.
          const auth = await requireIdentity(request, env, ['admin', 'scheduler', 'approver']);
          if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

          const body = await readJson(request);
          if (body === undefined || body === null || typeof body !== 'object') {
            return json(request, env, { ok: false, error: 'invalid_json' }, 400);
          }

          const updatedAt = await putKey(env, dbKey, body);
          return json(request, env, { ok: true, updatedAt });
        }

        if (request.method === 'DELETE') {
          const auth = await requireIdentity(request, env, ['admin']);
          if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

          await env.DB.prepare(
            'DELETE FROM app_data WHERE key = ?'
          ).bind(dbKey).run();

          await audit(env, auth.identity.user, 'month_deleted', { monthKey });
          return json(request, env, { ok: true });
        }
      }

      if (path === '/api/months' && request.method === 'GET') {
        const auth = await requireIdentity(request, env, AUTH.ROLES);
        if (!auth.ok) return json(request, env, { ok: false, error: auth.error }, auth.status);

        const result = await env.DB.prepare(`
          SELECT key, updated_at
          FROM app_data
          WHERE key LIKE 'month:%'
          ORDER BY key DESC
        `).all();

        return json(request, env, {
          ok: true,
          months: (result.results || []).map(r => ({
            key: String(r.key).replace(/^month:/, ''),
            updatedAt: r.updated_at,
          })),
        });
      }

      return json(request, env, { ok: false, error: 'not_found' }, 404);
    } catch (error) {
      return json(request, env, {
        ok: false,
        error: error.message || String(error),
      }, error.status || 500);
    }
  },
};
