const mode = require('../../mode.js')

const target = mode
    // ? 'https://paintpersona.com'
    ? 'http://localhost:4200'
    : 'http://localhost:4200'

const JSON_to_URLEncoded = (element,key,list) => {
    list = list || []
    if(typeof element == 'object')
        for (let idx in element)
        JSON_to_URLEncoded(element[idx],key?key+'['+idx+']':idx,list)
    else 
        list.push(key+'='+encodeURIComponent(element))
    return list.join('&')
}

const post = body => { return {
    method: "POST",
    body: JSON_to_URLEncoded(body || {}), 
    cache: 'no-cache',
    headers: {
        'Access-Control-Allow-Origin':'*',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
} }

const onFetch = (path, body) => fetch(
    path ? `${target}/${path}` : target, 
    post(body)
).then(res => res.json())

const get = async path => {
    let res = await fetch(path, {
        headers: {
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods': 'GET'
        }
    })
    return res.json()
}

module.exports = {
  post: (path, body) => onFetch(path, body),
  get
}
