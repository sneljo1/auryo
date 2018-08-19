export const getProxyUrlFromConfig = (proxy) => `https://${proxy.username ? `${proxy.username}:${proxy.password}@` : ''}${proxy.host}:${proxy.port || 443}`

export const groupBy = (xs, key) => xs.reduce((rv, x) => {
        (rv[x[key]] = rv[x[key]] || []).push(x) // eslint-disable-line
        return rv
    }, {})