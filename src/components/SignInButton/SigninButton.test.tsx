import { useSession } from 'next-auth/client';

import { mocked } from 'ts-jest/utils';

import { render, screen } from '@testing-library/react'
import { SignInButton } from '.';

jest.mock('next-auth/client')

describe('SigninButton compoent', () => {
  it('renders correctly when user is not authenticated', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SignInButton />)
  
    expect(screen.getByText("Sign in with Github")).toBeInTheDocument()
  });

  it('renders correctly when user is authenticated', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([
      { user: { name: 'Caio Buteri', email: 'caiobuteri10@gmail.com' }, expires: 'fake-expires' },
      false
    ]);
    
    render(<SignInButton />);

    expect(screen.getByText("Caio Buteri")).toBeInTheDocument()
  });
});
