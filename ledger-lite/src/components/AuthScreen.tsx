import { useState } from 'react';
import { useAuth } from '../store/AuthContext';

type Mode = 'login' | 'signup';
type SignupWith = 'new-team' | 'invite';

export function AuthScreen() {
  const { login, signup, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [signupWith, setSignupWith] = useState<SignupWith>('new-team');
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  function switchMode(next: Mode) {
    setMode(next);
    clearError();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await signup({
          email: email.trim(),
          password,
          name: name.trim(),
          teamName: signupWith === 'new-team' ? teamName.trim() : undefined,
          inviteCode: signupWith === 'invite' ? inviteCode.trim() : undefined,
        });
      }
    } catch {
      // error is surfaced via auth context state
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-mark">L</div>
        <h1 className="auth-title">Ledger</h1>
        <p className="auth-subtitle">Shared team logbook</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="auth-field">
              <span>Your name</span>
              <input
                className="auth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Osei"
                required
                autoFocus
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus={mode === 'login'}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              minLength={mode === 'signup' ? 8 : undefined}
              required
            />
          </label>

          {mode === 'signup' && (
            <>
              <div className="auth-subtabs">
                <button
                  type="button"
                  className={`auth-subtab${signupWith === 'new-team' ? ' active' : ''}`}
                  onClick={() => setSignupWith('new-team')}
                >
                  Start a new team
                </button>
                <button
                  type="button"
                  className={`auth-subtab${signupWith === 'invite' ? ' active' : ''}`}
                  onClick={() => setSignupWith('invite')}
                >
                  Join with invite code
                </button>
              </div>

              {signupWith === 'new-team' ? (
                <label className="auth-field">
                  <span>Team name</span>
                  <input
                    className="auth-input"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Product Engineering"
                    required
                  />
                </label>
              ) : (
                <label className="auth-field">
                  <span>Invite code</span>
                  <input
                    className="auth-input auth-input-mono"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="ABC1234"
                    required
                  />
                </label>
              )}
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
