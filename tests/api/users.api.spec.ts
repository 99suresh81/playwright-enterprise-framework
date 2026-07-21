import { test, expect } from '../../src/fixtures/api.fixture';
import { readJson } from '../../src/utils/data-provider.util';

/**
 * Same rule as the UI suite: type inline, at point of use — no
 * dedicated interface file per API payload.
 */
type CreateUserPayload = {
  name: string;
  job: string;
};

test.describe('Users API', () => {
  test('GET /users/2 returns user details', async ({ apiClient }) => {
    const response = await apiClient.get('/users/2');
    await apiClient.expectStatus(response, 200);

    const body = await response.json();
    expect(body.data.id).toBe(2);
  });

  test('POST /users creates a new user', async ({ apiClient }) => {
    const payload = readJson<CreateUserPayload>('api/create-user.json');

    const response = await apiClient.post('/users', { data: payload });
    await apiClient.expectStatus(response, 201);

    const body = await response.json();
    expect(body.name).toBe(payload.name);
  });

  test('GET /users/23 returns 404 for a missing user', async ({ apiClient }) => {
    const response = await apiClient.get('/users/23');
    await apiClient.expectStatus(response, 404);
  });
});
