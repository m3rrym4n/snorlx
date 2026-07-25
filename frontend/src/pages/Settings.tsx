import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Shield, Database, KeyRound, Copy, Check, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { tokensApi } from '../services/api';
import type { APIToken } from '../types';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [tokens, setTokens] = useState<APIToken[]>([]);
  const [tokenName, setTokenName] = useState('');
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    tokensApi.list()
      .then(setTokens)
      .catch((error: unknown) => {
        setTokenError(error instanceof Error ? error.message : 'Failed to load API tokens');
      })
      .finally(() => setLoadingTokens(false));
  }, []);

  const createToken = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tokenName.trim()) return;
    setSubmitting(true);
    setTokenError(null);
    try {
      const created = await tokensApi.create(tokenName.trim());
      setTokens((current) => [created, ...current]);
      setNewToken(created.token);
      setTokenName('');
      setCopied(false);
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : 'Failed to create API token');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToken = async () => {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken);
    setCopied(true);
  };

  const revokeToken = async (id: number) => {
    setTokenError(null);
    try {
      await tokensApi.revoke(id);
      setTokens((current) => current.filter((token) => token.id !== id));
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : 'Failed to revoke API token');
    }
  };

  const formatDate = (value: string | null) => value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Never';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your dashboard preferences
        </p>
      </div>

      {/* Appearance */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Theme
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                      theme === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Tokens */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">API Tokens</h2>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a long-lived token for trusted headless clients such as Home Assistant.
          </p>

          <form onSubmit={createToken} className="flex flex-col sm:flex-row gap-3">
            <label className="sr-only" htmlFor="api-token-name">Token name</label>
            <input
              id="api-token-name"
              value={tokenName}
              maxLength={255}
              onChange={(event) => setTokenName(event.target.value)}
              placeholder="Home Assistant"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={submitting || !tokenName.trim()}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Creating…' : 'Create token'}
            </button>
          </form>

          {newToken && (
            <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
              <p className="font-medium text-amber-900 dark:text-amber-200">
                Copy this token now. It won&apos;t be shown again.
              </p>
              <div className="flex gap-2 mt-3">
                <code className="min-w-0 flex-1 overflow-x-auto p-2 rounded bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100">
                  {newToken}
                </code>
                <button
                  type="button"
                  onClick={copyToken}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {tokenError && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">{tokenError}</p>
          )}

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {loadingTokens && <p className="py-4 text-sm text-gray-500">Loading tokens…</p>}
            {!loadingTokens && tokens.length === 0 && (
              <p className="py-4 text-sm text-gray-500 dark:text-gray-400">No API tokens yet.</p>
            )}
            {tokens.map((token) => (
              <div key={token.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{token.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created {formatDate(token.created_at)} · Last used {formatDate(token.last_used_at)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => revokeToken(token.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label={`Revoke ${token.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GitHub App */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">GitHub App</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Connected</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your GitHub App is connected and receiving webhooks
                </p>
              </div>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-sm text-green-600 dark:text-green-400">Active</span>
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Permissions</p>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <li>• actions: read</li>
                <li>• checks: read</li>
                <li>• metadata: read</li>
                <li>• deployments: read</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data Management</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Data Retention</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Workflow run data is retained for 1 year
                </p>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">365 days</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Data older than the retention period is automatically cleaned up by TimescaleDB retention policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
