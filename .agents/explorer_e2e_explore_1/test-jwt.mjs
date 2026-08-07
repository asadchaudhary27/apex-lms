import { encode, decode } from 'next-auth/jwt';

async function test() {
  const secret = 'supersecret123';
  const salt = 'authjs.session-token';
  const tokenPayload = {
    name: 'Super Admin',
    email: 'superadmin@lms.com',
    role: 'SUPER_ADMIN',
    branchId: 'hq-001',
    permissions: JSON.stringify({ allAccess: true }),
    sub: 'superadmin-id',
  };

  const token = await encode({
    token: tokenPayload,
    secret,
    salt,
  });
  console.log('ENCODED_TOKEN:', token);

  const decoded = await decode({
    token,
    secret,
    salt,
  });
  console.log('DECODED_PAYLOAD:', JSON.stringify(decoded));
}

test().catch(console.error);
