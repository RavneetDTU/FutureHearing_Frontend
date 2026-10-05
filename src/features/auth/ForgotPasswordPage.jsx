import { ArrowLeft, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api';
import { LogoMark } from '../../components/layout/Logo';
import { Alert, Button, FormField, Input } from '../../components/ui';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';

const FIELDS = [{ name: 'email', label: 'Email', required: true }];

export function ForgotPasswordPage() {
  const form = useForm({ email: '' }, FIELDS);
  const { mutate, loading, error } = useMutation((values) => authApi.forgotPassword(values));
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    try {
      setResult(await mutate(form.values));
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
              Reset password
            </h1>
          </div>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Enter the email on your account. If it exists, the backend will create a reset token.
        </p>
        {error && <Alert tone="danger">{error.message}</Alert>}
        {result ? (
          <Alert tone="success" title="Request sent">
            {result.message || 'If an account exists, you will receive reset instructions.'}
            {result.resetToken && (
              <div style={{ marginTop: 8 }}>
                SMTP is not configured, so the token is shown once:{' '}
                <Link to={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}>Continue to set a new password</Link>
              </div>
            )}
          </Alert>
        ) : (
          <FormField label="Email" required error={form.errors.email}>
            {({ id }) => (
              <Input id={id} type="email" autoComplete="email" value={form.values.email} onChange={(e) => form.setValue('email', e.target.value)} />
            )}
          </FormField>
        )}
        {!result && (
          <Button type="submit" variant="primary" icon={Mail} loading={loading} block>
            Send reset link
          </Button>
        )}
        <Link to="/login" className="row" style={{ justifyContent: 'center' }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </form>
    </div>
  );
}
