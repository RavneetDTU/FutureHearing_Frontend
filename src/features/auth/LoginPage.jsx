import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { LogoMark } from '../../components/layout/Logo';
import { Alert, Button, FormField, Input } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';

const FIELDS = [
  { name: 'username', label: 'Username or email', required: true },
  { name: 'password', label: 'Password', required: true },
];

/** Credentials go to POST /auth/login. Token is kept in memory; the backend also sets fh_session. */
function pendingAccessFrom(res) {
  if (!res || typeof res !== 'object') return null;
  const body = res.data && typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : res;
  if (body.access === 'pending' || (Boolean(body.requestId) && !body.token && !body.user)) return body;
  return null;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: sessionLoading, setUser } = useSession();
  const form = useForm({ username: '', password: '' }, FIELDS);
  const { mutate, loading, error } = useMutation((values) => authApi.login(values));
  const [pendingAccess, setPendingAccess] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    setPendingAccess(null);
    try {
      const res = await mutate(form.values);
      const pending = pendingAccessFrom(res);
      if (pending) {
        setPendingAccess(pending);
        return;
      }
      if (!res?.token && !res?.user && !res?.id) {
        setPendingAccess({
          access: 'pending',
          message: res?.message || 'This sign-in is waiting for an administrator to approve this IP address.',
        });
        return;
      }
      setUser(res);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const pending = pendingAccessFrom(err.payload) || pendingAccessFrom(err.payload?.data);
      if (pending || err.code === 'access_pending') {
        setPendingAccess(pending || { message: err.message, access: 'pending' });
        return;
      }
      form.applyServerErrors(err);
    }
  };

  if (!sessionLoading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <div className="auth-brand">
          <span className="auth-logo">
            <LogoMark size={34} />
          </span>
          <div>
            <div className="page-eyebrow" style={{ margin: 0 }}>
              Operations portal
            </div>
            <h1 className="page-title" style={{ fontSize: 24 }}>
              <strong>Future</strong> Hearing
            </h1>
          </div>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Sign in to manage patients, sales, stock and medical aid claims.
        </p>
        {pendingAccess && (
          <Alert tone="warning" title="Waiting for approval">
            {pendingAccess.message ||
              'This sign-in is waiting for an administrator to approve this IP address. You can sign in from this network after it is approved under Access requests → List access requests.'}
          </Alert>
        )}
        {error && !pendingAccess && (
          <Alert tone={error.status === 403 ? 'warning' : 'danger'}>
            {error.status === 401 ? 'Incorrect username or password.' : error.message}
          </Alert>
        )}
        <FormField label="Username or email" required error={form.errors.username}>
          {({ id }) => (
            <Input id={id} autoComplete="username" value={form.values.username} onChange={(e) => form.setValue('username', e.target.value)} />
          )}
        </FormField>
        <FormField label="Password" required error={form.errors.password}>
          {({ id }) => (
            <Input
              id={id}
              type="password"
              autoComplete="current-password"
              value={form.values.password}
              onChange={(e) => form.setValue('password', e.target.value)}
            />
          )}
        </FormField>
        <div className="row-between">
          <span />
          <Link to="/forgot-password" className="text-sm">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="primary" icon={LogIn} loading={loading} block>
          Sign in
        </Button>
      </form>
    </div>
  );
}
