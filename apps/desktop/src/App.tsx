import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

export const App = (): JSX.Element => <RouterProvider router={router} />;
