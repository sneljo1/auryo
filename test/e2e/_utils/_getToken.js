import axios from 'axios';
let token = null;
import fs from 'fs';
import path from 'path';

// Cache token so we don't run into any limiting
const location = path.resolve(__dirname, 'token.txt');

if (!fs.existsSync(location)) {
  fs.writeFileSync(location, '');
}

token = fs.readFileSync(location);

export const getToken = async hasToken => {
  if (hasToken) return Promise.resolve(hasToken);

  if (token && token.length) {
    return Promise.resolve(token);
  }

  try {
    const data = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'password',
      username: process.env.SC_USER,
      password: process.env.SC_PASS
    };

    token = await new Promise((resolve, reject) => {
      axios
        .post('https://api.soundcloud.com/oauth2/token', data, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => res.data)
        .then(body => {
          if (body.access_token) {
            return resolve(body.access_token);
          } else {
            return reject(body);
          }
        })
        .catch(err => {
          fs.writeFileSync(location, '');

          reject(
            error || {
              status: response.statusCode,
              message: response.statusMessage,
              body: response.body
            }
          );
        });
    });

    fs.writeFileSync(location, token);

    return token;
  } catch (err) {
    throw err;
  }
};
