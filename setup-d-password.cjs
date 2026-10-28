// Run locally. Never put your password or the output in the repository.
const crypto = require('node:crypto');
const readline = require('node:readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log('Choose a long, unique password. It will be visible while you type; do not share your screen.');
rl.question('Password: ', password => {
  if (password.length < 16) { console.error('Use at least 16 characters.'); rl.close(); process.exitCode = 1; return; }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  console.log('\nD_PASSWORD_HASH=' + salt + ':' + hash);
  console.log('D_SESSION_SECRET=' + crypto.randomBytes(32).toString('hex'));
  console.log('\nCopy each value into Cloudflare as an encrypted secret. Do not share these values.');
  rl.close();
});
