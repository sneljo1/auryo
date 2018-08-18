import request from "request"
let token = null;

export const getToken = (hasToken) => {

    if (hasToken) return Promise.resolve(hasToken);

    if (token) {
        return Promise.resolve(token)
    }

    const options = {
        url: 'https://api.soundcloud.com/oauth2/token',
        form: {
            client_id: process.env.CLIENT_ID_DEV,
            client_secret: process.env.CLIENT_SECRET_DEV,
            grant_type: 'client_credentials'
        }
    }

    return new Promise((resolve, reject) => {
        request.post(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                body = JSON.parse(body)
                if (body.access_token) {
                    return resolve(body.access_token)
                } else {
                    return reject(body)
                }
            }

            reject(error || {
                status: response.statusCode,
                message: response.statusMessage,
                body: response.body
            })
        })
    }).then(t => {
        token = t;

        return token;
    })

}