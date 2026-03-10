import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should login and set user, token, and isAuthenticated', () => {
    const user = {
      id: 1,
      username: 'admin',
      email: 'admin@pharmacy.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' as const,
    };

    useAuthStore.getState().login(user, 'jwt-token-123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.token).toBe('jwt-token-123');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should logout and clear all auth state', () => {
    // First login
    useAuthStore.getState().login(
      { id: 1, username: 'test', email: 'test@test.com', firstName: 'T', lastName: 'U', role: 'user' as const },
      'token'
    );

    // Then logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should update user without affecting token or isAuthenticated', () => {
    // Login first
    const originalUser = {
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
      firstName: 'Old',
      lastName: 'Name',
      role: 'admin' as const,
    };
    useAuthStore.getState().login(originalUser, 'my-token');

    // Update user
    const updatedUser = { ...originalUser, firstName: 'New', lastName: 'Updated' };
    useAuthStore.getState().updateUser(updatedUser);

    const state = useAuthStore.getState();
    expect(state.user?.firstName).toBe('New');
    expect(state.user?.lastName).toBe('Updated');
    expect(state.token).toBe('my-token');
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle multiple login/logout cycles', () => {
    const user1 = { id: 1, username: 'u1', email: 'u1@t.com', firstName: 'A', lastName: 'B', role: 'user' as const };
    const user2 = { id: 2, username: 'u2', email: 'u2@t.com', firstName: 'C', lastName: 'D', role: 'admin' as const };

    useAuthStore.getState().login(user1, 'token1');
    expect(useAuthStore.getState().user?.id).toBe(1);

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    useAuthStore.getState().login(user2, 'token2');
    expect(useAuthStore.getState().user?.id).toBe(2);
    expect(useAuthStore.getState().token).toBe('token2');
  });
});
