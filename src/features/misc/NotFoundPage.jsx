import { Compass } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Button, Card, EmptyState, ErrorState } from '../../components/ui';

export function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        icon={Compass}
        title="Page not found"
        message="The page you are looking for doesn't exist or has moved."
        action={
          <Button variant="primary" to="/dashboard">
            Back to dashboard
          </Button>
        }
      />
    </Card>
  );
}

export function RouteErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;
  return (
    <Card>
      <ErrorState
        title="Something went wrong"
        message="An unexpected error occurred while displaying this page."
        onRetry={() => window.location.reload()}
      />
    </Card>
  );
}
