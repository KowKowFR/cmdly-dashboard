/** SWR fetcher that turns non-2xx responses into thrown errors. */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error as string;
    } catch {
      // non-JSON body; keep the status message
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
