/** Follow only same-origin HTTPS redirects; cookies are transient and never persisted. */
export function officialSession(fetcher: typeof fetch = fetch): typeof fetch {
  const cookies = new Map<string, Map<string, string>>();
  return (async (input, init) => {
    const original = new URL(String(input));
    if (original.protocol !== 'https:' || !original.hostname.endsWith('.gov.br') || original.username || original.password || original.port) throw new Error('Official HTTPS URL required');
    let url = original;
    for (let hop = 0; hop <= 5; hop++) {
      const jar = cookies.get(url.origin) ?? new Map<string, string>();
      const headers = new Headers(init?.headers);
      if (jar.size) headers.set('cookie', [...jar].map(([key, value]) => `${key}=${value}`).join('; '));
      const response = await fetcher(url, { ...init, headers, redirect: 'manual' });
      for (const cookie of response.headers.getSetCookie()) {
        const pair = cookie.split(';')[0], separator = pair.indexOf('=');
        if (separator > 0) jar.set(pair.slice(0, separator), pair.slice(separator + 1));
      }
      cookies.set(url.origin, jar);
      if (![301, 302, 303, 307, 308].includes(response.status)) return response;
      await response.body?.cancel();
      const location = response.headers.get('location');
      if (!location) throw new Error('Redirect without location');
      const next = new URL(location, url);
      if (next.origin !== original.origin || next.username || next.password) throw new Error('Cross-origin redirect rejected');
      url = next;
    }
    throw new Error('Official redirect limit exceeded');
  }) as typeof fetch;
}
