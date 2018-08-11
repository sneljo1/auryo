export function truncate(str, length = 50, append = '...', f) {

    if (f) {
        str = filter(str)
    }

    if (str.length > length) {
        str = str.substr(0, length - append.length)
        if (append) {
            str += append
        }
    }

    return str
}

export function filter(str) {
    str = str.replace(/\[(.*?)]/g, '')
    return str
}

export function abbreviate_number(num, fixed) {
    if (num === null || !num || num == 0) {
        return '0'
    } // terminate early

    fixed = (!fixed || fixed < 0) ? 0 : fixed // number of decimal places to show
    let b = (num).toPrecision(2).split('e'), // get power
        k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
        c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
        d = c < 0 ? c : Math.abs(c)

    return d + ['', 'K', 'M', 'B', 'T'][k] // append power
}

export function getReadableTime(sec, ms, with_seconds) {
    if (!sec) return '00:00'

    //Get hours from milliseconds
    let hours = sec / (60 * 60)
    if (ms) {
        hours = sec / (60 * 60 * 1000)
    }
    const absoluteHours = Math.floor(hours)
    const h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours

    //Get remainder from hours and convert to minutes
    const minutes = (hours - absoluteHours) * 60
    const absoluteMinutes = Math.floor(minutes)
    const m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes

    //Get remainder from minutes and convert to seconds
    const seconds = (minutes - absoluteMinutes) * 60
    const absoluteSeconds = Math.floor(seconds)
    const s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds


    let str = ''

    if (h != '00') {
        str += h + ':' + m + (with_seconds ? ':' + s : '')
    } else {

        str += m + ':' + s
    }


    return str
}

export function getReadableTimeFull(sec, inMs) {
    if (!sec) return '0min.'

    //Get hours from milliseconds
    let hours = sec / (60 * 60)
    if (inMs) {
        hours = sec / (60 * 60 * 1000)
    }
    const h = Math.floor(hours)

    //Get remainder from hours and convert to minutes
    const minutes = (hours - h) * 60
    const m = Math.floor(minutes)

    //Get remainder from minutes and convert to seconds
    const seconds = (minutes - m) * 60
    const s = Math.floor(seconds)


    let str = ''

    if (h !== 0) {
        str += `${h}h ${m}min.`
    } else {
        str += `${m}min.`
    }


    return str
}

export function getPos(e, el) {
    if (!el) {
        el = e.currentTarget
    }

    const box = el.getBoundingClientRect()
    const start = box.left

    return (e.clientX - start) / box.width
}

export function setToValue(obj, value, path) {
    let i
    path = path.split('.')
    let rec = obj
    for (i = 0; i < path.length - 1; i++)
        rec = rec[path[i]]

    rec[path[i]] = value

    return obj
}