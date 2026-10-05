import { ArrowLeft, KeyRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api';
import { LogoMark } from '../../components/layout/Logo';
import { Alert, Button, FormField, Input } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';

const FIELDS = [
  { name: 'password', label: 'New password', required: true },
  { name: 'confirm', label: 'Confirm password', required: true },
];

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const toast = useToast();
  const form = useForm({ password: '', confirm: '' }, FIELDS);
  const { mutate, loading, error } = useMutation((payload) => authApi.resetPassword(payload));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    if (form.values.password !== form.values.confirm) {
      form.applyServerErrors({ fieldErrors: { confirm: 'Passwords do not match.' } });
      return;
    }
    try {
      await mutate({ token, password: form.values.password });
      toast.success('Password updated', 'You can sign in with the new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      form.applyServerErrors(err);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <div className="auth-brand">
          <span className="auth-logo">
            <LogoMark size={34} />
          </span>
          <div>
            <div className="page-eyebrow" style={{ margin: 0 }}>
              Account
            </div>
            <h1 className="page-title" style={{ fontSize: 24 }}>
              Set a new password
            </h1>
          </div>
        </div>
        {!token && <Alert tone="danger">This reset link is missing a token. Request a new one from the sign-in page.</Alert>}
        {error && <Alert tone="danger">{error.message}</Alert>}
        <FormField label="New password" required error={form.errors.password}>
          {({ id }) => (
            <Input id={id} type="password" autoComplete="new-password" value={form.values.password} onChange={(e) => form.setValue('password', e.target.value)} />
          )}
        </FormField>
        <FormField label="Confirm password" required error={form.errors.confirm}>
          {({ id }) => (
            <Input id={id} type="password" autoComplete="new-password" value={form.values.confirm} onChange={(e) => form.setValue('confirm', e.target.value)} />
          )}
        </FormField>
        <Button type="submit" variant="primary" icon={KeyRound} loading={loading} disabled={!token} block>
          Update password
        </Button>
        <Link to="/login" className="row" style={{ justifyContent: 'center' }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </form>
    </div>
  );
}
