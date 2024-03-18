import { FORGOT_PASSWORD } from '@/common/routes';
import { Alert, AlertDescription, AlertTitle } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useState } from 'react';
import {
  useLocation,
  useNavigation,
  useActionData,
  Form,
  Link,
} from 'react-router-dom';

function Login() {
  const [data, setData] = useState({
    email: '',
    password: '',
  });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get('from') || '/';

  const navigation = useNavigation();
  const isLoggingIn = navigation.formData?.get('email') != null;

  const actionData = useActionData() as { error: string } | undefined;

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-10 w-auto"
          src="https://cdn-icons-png.flaticon.com/512/906/906343.png"
          alt="Your Company"
        />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Admin
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <Form method="post" className="space-y-6" replace>
            <input type="hidden" name="redirectTo" value={from} />

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email
              </label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={data.email}
                  onChange={(e) =>
                    setData({
                      ...data,
                      email: e.currentTarget.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={data.password}
                  onChange={(e) =>
                    setData({
                      ...data,
                      password: e.currentTarget.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Button type="submit" disabled={isLoggingIn} className="w-full">
                {isLoggingIn ? '...' : 'Login'}
              </Button>
            </div>

            {actionData && actionData.error ? (
              <Alert variant={'destructive'}>
                <AlertTitle>Invalid Login Attempt</AlertTitle>
                <AlertDescription>
                  Looks like something went wrong. Please check your credentials
                  and try again.
                </AlertDescription>
              </Alert>
            ) : null}
          </Form>
          <div className="mt-6 text-center text-sm text-gray-600">
            <Link to={FORGOT_PASSWORD}>Forgot password? Click here.</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
